import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pt_servers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary()
      table.string('url').notNullable().unique()
      table.string('name').notNullable()
      table.integer('capacity').notNullable()
      table.string('statut').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
