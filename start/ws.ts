import app from '@adonisjs/core/services/app'
import AdonisWS from "#services/adonis_ws";
import PTServer from "#models/pt_server";
import Lobby from "#models/lobby";
import Group from "#models/group";

app.ready(() => {
  // reset des groupes (en cascade sur la table 'user_groups')
  Group.all()
    .then((groups: Group[]) => groups.forEach((group: Group) => group.delete()))
  // reset des lobbies (en cascade sur la table 'user_lobbies')
  Lobby.all()
    .then((lobbys: Lobby[]) => lobbys.forEach((lobby: Lobby) => lobby.delete()))
    .then(() => {
      AdonisWS.boot()
      AdonisWS.initSocketEvents()

      // set les serveurs jeu par défaut en offline + tentative de connection
      PTServer.all().then((servers) => {
        servers.forEach(async (server) => {
          await server.setOffline()
          server.initConnection()
        })
      })
    })
})
