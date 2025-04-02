import app from '@adonisjs/core/services/app'
import AdonisWS from "#services/adonis_ws";
import PTServer from "#models/pt_server";
import env from "#start/env";
import Games from "#models/games";

app.ready(async () => {

  try {
    await PTServer.updateOrCreate({id:1}, {id: 1, url: env.get('GS_1_HOST'), name: 'gs1-local-test', capacity: 1, statut: 'offline'})
    registerGamesInDB('checkers', 2)
    registerGamesInDB('dorian_game', 2)

    AdonisWS.boot()
    AdonisWS.initSocketEvents()

    // set les serveurs jeu par défaut en offline + tentative de connection
    PTServer.all().then((servers) => {
      servers.forEach(async (server) => {
        await server.setOffline()
        server.initConnection()
      })
    })


  } catch (e) {
    console.error(e)
  }

})

function registerGamesInDB(game: string, max_players: number) {
  Games.updateOrCreate({game: game},{
    game: game,
    max_player: max_players
  }).then(() => console.log(game + ' updated !'));
}
