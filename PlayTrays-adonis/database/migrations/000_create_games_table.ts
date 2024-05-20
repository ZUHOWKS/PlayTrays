import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('game').primary()
      table.integer('max_player')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
