import { BaseModel, column } from '@adonisjs/lucid/orm'
import db from "@adonisjs/lucid/services/db";
import User from "#models/user";
import Adonis_ws from "#services/adonis_ws";
import Group from "#models/group";


export default class Lobby extends BaseModel {
  static table = 'lobbies'

  @column({ isPrimary: true })
  declare uuid: string

  @column()
  declare server_id: number

  @column()
  declare game: string

  @column()
  declare statut: "waiting" | "running" | "finished"

  @column()
  declare visibility: "public" | "private"

  /**
   * Rejoindre un lobby.
   *
   * @param user utilisateur
   */
  public async join(user: User) {
    await db.table('user_lobbies').insert({
      lobby_uuid: this.uuid,
      user_id: user.id
    })
    return
  }

  /**
   * Rejoindre un lobby à une liste de joueur dans le même groupe.
   *
   * @param users
   * @assertion users.length > 0
   */
  public async joinAllGrouped(users: User[]) {

    for (const user of users) {
      await this.join(user)
    }

    // Permet de faire rejoindre au groupe la room
    const userGroup: Group | null = await users[0].getGroup()
    if (userGroup) {
      // communiquer à la room du groupe qu'ils ont rejoint le lobby
      Adonis_ws.io?.to('g'+userGroup.id).emit('lobby_join_room')
    }
  }

  /**
   * Obtenir le nombre de joueurs actuel dans le lobby.
   */
  public async getPlayerNumber() {
    return (await db.from('user_lobbies')
      .where('lobby_uuid', this.uuid)
      .count('user_id', 'total')
      .first()).total as number
  }

  public async getPlayers() {
     const res = (await db.from('user_lobbies')
      .select('user_id as id')
      .where('lobby_uuid', this.uuid))
    const users: User[] = []
    for (const u of res) {
      const user: User | null = await User.find(u.id);
      if (user) users.push(user);
    }

    return users
  }

  /**
   * Checker si le lobby est au complet.
   */
  public async isReady(): Promise<boolean> {
    const resGame = await db.from('games').select('game', 'max_player as max').where('game', this.game).first()
    return await this.getPlayerNumber() >= (resGame.max)
  }

  /**
   * Notifier les joueurs de la room du lancement de la partie.
   */
  public async lauch() {
    Adonis_ws.io?.to('l' + this.uuid).emit('matchmaking_confirm', {
      message: 'Connection to the party...'
    })

  }

}
