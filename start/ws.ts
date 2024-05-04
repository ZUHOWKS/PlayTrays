import app from '@adonisjs/core/services/app'
import AdonisWS from "#services/adonis_ws";
import PTServer from "#models/pt_server";
import Lobby from "#models/lobby";
import db from "@adonisjs/lucid/services/db";

app.ready(async () => {


  /*
  // reset des groupes (en cascade sur la table 'user_groups')
  Group.query()
    .delete()

   */


  // reset des lobbies (en cascade sur la table 'user_lobbies')
  Lobby.query()
    .delete()

  AdonisWS.boot()
  AdonisWS.initSocketEvents()


  try {

    const result = await db.rawQuery(`
      SELECT EXISTS (
        SELECT 1
        FROM   information_schema.tables
        WHERE  table_name = 'pt_servers'
      ) AS table_exists;
    `)

    if (result[0][0].table_exists > 0) {
      // set les serveurs jeu par défaut en offline + tentative de connection
      PTServer.all().then((servers) => {
        servers.forEach(async (server) => {
          await server.setOffline()
          server.initConnection()
        })
      })
    }


  } catch (e) {
    console.error(e)
  }

})
