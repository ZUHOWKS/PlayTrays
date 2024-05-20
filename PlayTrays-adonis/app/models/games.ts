import {BaseModel, column} from "@adonisjs/lucid/orm";

export default class Games extends BaseModel {
  static table = 'games'
  @column({isPrimary: true})
  declare game: string

  @column()
  declare max_player: number

}
