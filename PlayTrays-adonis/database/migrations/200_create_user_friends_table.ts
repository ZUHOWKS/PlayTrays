import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_friends'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('user1')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
      table.integer('user2')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.boolean('accepted')
        .notNullable()
        .defaultTo(false)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
