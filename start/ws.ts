import app from '@adonisjs/core/services/app'
import AdonisWS from "#services/adonis_ws";
import PTServer from "#models/pt_server";
import Lobby from "#models/lobby";

app.ready(() => {

  Lobby.all()
    .then((lobbys) => lobbys.forEach((lobby) => lobby.delete()))
    .then(() => {
      AdonisWS.boot()
      AdonisWS.initSocketEvents()

      PTServer.all().then((servers) => {
        servers.forEach(async (server) => {
          await server.setOffline()
          server.initConnection()
        })
      })
    })



})
