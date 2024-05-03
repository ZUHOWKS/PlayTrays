
import {BaseModel, column} from "@adonisjs/lucid/orm";
import Lobby from "#models/lobby";

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare leader_id: number

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

}
