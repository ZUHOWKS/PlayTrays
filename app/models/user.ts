import { DateTime } from 'luxon'
import { withAuthFinder } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import db from "@adonisjs/lucid/services/db";
import Group from "#models/group";

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
   * Obtenir la list le groupe dans lequel est l'utilisateur.
   * Null si l'utilisateur n'est pas groupé.
   */
  public async getGroup(): Promise<Group | null> {
      return Group.query()
          .join('user_groups', (query) => {
            query
              .on('groups.id', '=', 'user_groups.group_id')
          })
          .where('groups.leader_id', this.id)
          .orWhere('user_groups.user_id', this.id)
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
}
