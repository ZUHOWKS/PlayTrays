import app from '@adonisjs/core/services/app'
import AdonisWS from "#services/adonis_ws";
import PTServer from "#models/pt_server";
import Lobby from "#models/lobby";
import Group from "#models/group";
import env from "#start/env";
import Games from "#models/games";

app.ready(async () => {

  try {
    // reset des groupes (en cascade sur la table 'user_groups')
    Group.query()
      .delete().then(() => console.log('groups reset !'))

    // reset des lobbies (en cascade sur la table 'user_lobbies')
    Lobby.query()
      .delete().then(() => console.log('lobbies reset !'))

    AdonisWS.boot()
    AdonisWS.initSocketEvents()

    await PTServer.updateOrCreate({id:1}, {id: 1, url: env.get('GS_1_HOST'), name: 'gs1-local-test', capacity: 1, statut: 'offline'})

    registerGamesInDB('checkers', 2)
    registerGamesInDB('dorianGame', 2)

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
