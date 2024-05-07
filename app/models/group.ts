
import {BaseModel, column} from "@adonisjs/lucid/orm";
import Lobby from "#models/lobby";
import User from "#models/user";
import db from "@adonisjs/lucid/services/db";

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare leader_id: number

  /**
   * Obtenir le lobby où au moins un des joueurs du groupe est présent
   */
  public async getLobby(): Promise<Lobby | null> {
    return await Lobby.query()
      .select('lobbies.uuid')
      .leftJoin('user_lobbies', 'lobbies.uuid', 'user_lobbies.lobby_uuid')
      .leftJoin('user_groups', 'user_groups.user_id', 'user_lobbies.user_id')
      .leftJoin('groups', 'groups.leader_id', 'user_lobbies.user_id')
      .where('user_groups.group_id', 1)
      .orWhere('groups.id', 1)
      .groupBy('lobbies.uuid').first()
  }

  /**
   * Obtenir la liste des joueurs groupés
   */
  public async getUsers(): Promise<User[]> {
    return User
      .query()
      .select('users.id')
      .leftJoin('groups', join => {
        join.on('users.id', 'groups.leader_id').andOnVal('groups.id', this.id)
      })
      .leftJoin('user_groups', join => {
        join.on('users.id', 'user_groups.user_id')
          .andOnVal('user_groups.group_id', this.id)
          .andOnVal('user_groups.invite_accepted', true)
      })
      .whereNotNull('groups.leader_id')
      .orWhereNotNull('user_groups.user_id')
      .distinct()
  }

  /**
   * Donner le lead à un autre utilisateur.
   *
   * @param user utilisateur à qui on fournit le lead
   */
  public async letTheLead(user: User): Promise<boolean> {
    const _userLeader: User | null = await User.find(this.leader_id)
    if (_userLeader) {
      await db.table('user_groups').insert({
          group_id: this.id,
          user_id: _userLeader.id,
          invite_accepted: true
        })
      await db.from('user_groups').delete()
        .where('user_id', user.id)
      this.leader_id = user.id
      await this.save()

      return true
    }

    return false
  }

  public async invite(userId: number) {
    const res = await db.from('user_groups')
      .where('group_id', this.id)
      .andWhere('user_id', userId)
      .first()
    if (!res) await db.table('user_groups').insert({
      group_id: this.id,
      user_id: userId,
      invite_accepted: false
    })
  }

  /**
   * Connaître si un joueur a été invité dans le groupe.
   *
   * @param userId id de l'utilisateur
   */
  public async isInvited(userId: number) {
    return await db.from('user_groups')
      .select('group_id')
      .where('group_id', this.id)
      .andWhere('user_id', userId)
      .first() != null
  }



  /**
   * Permet de confirmer l'invitation d'un utilisateur.
   *
   * @param user utilisateur invité
   */
  public async confirmInvitationOf(user: User) {

    await user.leaveGroup()

    await this.deleteUserInvitation(user.id)

    await db.from('user_groups').update({
      invite_accepted: true
    }).where('user_id', user.id)
      .andWhere('group_id', this.id)

  }

  /**
   * Supprimer toutes les invitations utilisateurs hors mis celle du groupe
   * actuel.
   *
   * @param userId
   */
  public async deleteUserInvitation(userId: number) {

    await db.from('user_groups').delete()
      .where('user_id', userId)
      .andWhere('group_id', '!=', this.id)

  }

  public async getMemberNumber(): Promise<number> {
    const res = await db.from('user_groups')
      .where('group_id', this.id)
      .andWhere('invite_accepted', true)
      .count('user_id as total')
      .first()

    return 1 + res.total
  }

}
