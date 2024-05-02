import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lobbys'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('uuid').primary()
      table.integer('server_id')
        .notNullable()
        .references('id')
        .inTable('pt_servers')
        .onDelete('CASCADE')
      table.string('game')
        .notNullable()
        .references('game')
        .inTable('games')
        .onDelete('CASCADE')
      table.string('statut').notNullable()
      table.string('visibility').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
