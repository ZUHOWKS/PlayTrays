import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_lobbies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('lobby_uuid')
        .notNullable()
        .references('uuid')
        .inTable('lobbies')
        .onDelete('CASCADE')
      table.integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
