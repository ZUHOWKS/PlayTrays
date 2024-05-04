import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('group_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('groups')
        .onDelete('CASCADE')
      table.integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.boolean('invite_accepted')
        .notNullable()
        .defaultTo(false)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
