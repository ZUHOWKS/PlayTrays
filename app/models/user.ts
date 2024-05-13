import { DateTime } from 'luxon'
import { withAuthFinder } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import db from "@adonisjs/lucid/services/db";
import Group from "#models/group";
import Adonis_ws from "#services/adonis_ws";
import Lobby from "#models/lobby";

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare username: string

  @column()
  declare password: string

  @column()
  declare points: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  /**
   * Obtenir la liste des joueurs groupés
   * @param groupID
   * @deprecated
   */
  static async getGroupedUsers(groupID: number) {
    return User
      .query()
      .join('user_groups', (query) => {
        query
          .on('users.id', '=', 'user_groups.user_id')
      }).join('groups', 'groups.leader_id', 'users.id')
      .groupBy('groups.id')
      .where('user_groups.group_id', groupID)
      .where('groups.id', groupID)
  }

  /**
   * Obtenir le groupe dans lequel est l'utilisateur.
   * Null si l'utilisateur n'est pas groupé.
   */
  public async getGroup(): Promise<Group | null> {
      let _g: Group | null = await Group.findBy({leader_id: this.id})

      return _g ? _g : await Group.query()
        .select('groups.id')
        .join('user_groups', (query) => {
          query
            .on('groups.id', '=', 'user_groups.group_id')
            .andOnVal('user_groups.invite_accepted', true)
        })
        .where('user_groups.user_id', this.id)
        .first()

  }

  /**
   * Permet de savoir si le joueur est leader d'un groupe.
   */
  public async isLeader() {
    return (await db.from('user_groups')
        .select('user_id')
        .where('user_id', '!=', this.id)
        .first()
    ) == null
  }

  /**
   * Quitter le groupe actuel
   */
  public async leaveGroup() {
    const _g: Group | null = await this.getGroup()

    if (_g) {
      let _gUsers: User[] = await _g.getUsers();
      let i = 0;
      _gUsers.forEach((_u) => {
        if (_u.id == this.id) {
          _gUsers.splice(i, 1)
        }
        i++
      })

      if (_g.leader_id == this.id) {
        if (_gUsers.length > 0) {
          await _g.letTheLead(_gUsers[0])
        } else {
          await _g.delete() // supprime le groupe s'il est vide
        }
      }

      await db.from('user_groups').delete()
        .where('user_id', this.id)
        .andWhere('group_id', _g.id)

      Adonis_ws.io?.to('g' + _g.id).emit('group_update')
    }
  }

  /**
   * Savoir si un utilisateur est un ami.
   *
   * @param user
   */
  public async isFriend(user: User): Promise<boolean> {
    return await db.from('user_friends')
      .where((q) => {
        q.where('user1', user.id)
          .andWhere('user2', this.id)
          .andWhere('accepted', true)
      })
      .orWhere((q) => {
        q.where('user1', this.id)
          .andWhere('user2', user.id)
          .andWhere('accepted', true)
      }).first() != null
  }

  /**
   * Faire une demande d'ami à un utilisateur.
   *
   * @param user utilisateur à demandé en ami
   */
  public async friendInvitation(user: User) {
    const res = await db.from('user_friends')
      .where((q) => {
        q.where('user1', user.id)
          .andWhere('user2', this.id)
      })
      .orWhere((q) => {
        q.where('user1', this.id)
          .andWhere('user2', user.id)
      }).first()



    if (!res) {
      await db.table('user_friends')
        .insert({
          user1: this.id,
          user2: user.id,
          accepted: false
        })
    }
  }

  /**
   * Accepter la demande d'ami d'un utilisateur.
   *
   * @param user
   */
  public async friendAccept(user: User) {
    return db.from('user_friends')
      .where((q) => {
        q.where('user1', user.id)
          .andWhere('user2', this.id)
      })
      .orWhere((q) => {
        q.where('user1', this.id)
          .andWhere('user2', user.id)
      }).update({
        accepted: true
      });
  }

  /**
   * Obtenir la liste des utilisateurs amis.
   */
  public async friends(): Promise<User[]> {
    const users: User[] = [];

    let _users = await db.from('user_friends')
      .select('user2')
      .where('user1', this.id)
      .andWhere('accepted', true)
      .distinct()

    for (const _u of _users) {
      const _uFind: User | null = await User.find(_u.user2)
      if (_uFind) users.push(_uFind);
    }

    _users = await db.from('user_friends')
      .select('user1')
      .where('user2', this.id)
      .andWhere('accepted', true)
      .distinct()

    for (const _u of _users) {
      const _uFind: User | null = await User.find(_u.user1)
      if (_uFind) users.push(_uFind);
    }

    return users
  }

  /**
   * Obtenir la liste des utilisateurs ayant fait une demande d'ami
   */
  public async getFriendInvite(): Promise<User[]> {
    const users: User[] = [];

    const _users = await db.from('user_friends')
      .select('user1')
      .where('user2', this.id)
      .andWhere('accepted', false)

    for (const _u of _users) {
      const _uFind: User | null = await User.find(_u.user1)
      if (_uFind) users.push(_uFind);
    }

    return users
  }

  /**
   * Obtenir la liste des utilisateurs demandés en ami.
   */
  public async getOwnFriendInvite(): Promise<User[]> {
    const users: User[] = [];

    const _users = await db.from('user_friends')
      .select('user2')
      .where('user1', this.id)
      .andWhere('accepted', false)

    for (const _u of _users) {
      const _uFind: User | null = await User.find(_u.user2)
      if (_uFind) users.push(_uFind);
    }

    return users
  }

  /**
   * Obtenir le lobby actuel du joueur: Null si il n'est pas dans un lobby.
   */
  public async getLobby(): Promise<Lobby | null> {
    return await Lobby.query()
      .join('user_lobbies', 'lobbies.uuid', 'user_lobbies.lobby_uuid')
      .where('user_lobbies.user_id', this.id)
      .first()
  }

  public async leaveLobby() {
    return db.from('user_lobbies')
      .delete()
      .where('user_id', this.id)
  }
}
