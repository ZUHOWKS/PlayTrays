import {BaseModel, column} from "@adonisjs/lucid/orm";
import {io} from "socket.io-client";
import env from "#start/env";
import PTServerSockets from "../modules/pt_server_sockets.js";
import AdonisWS from "#services/adonis_ws";
import User from "#models/user";
import Lobby from "#models/lobby";


export default class PTServer extends BaseModel {
  static table = 'pt_servers'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare url: string

  @column()
  declare name: string

  @column()
  declare capacity: number

  @column()
  declare statut: 'offline' | 'online'

  /**
   * Initialiser les évènements de la websocket.
   * Les évènements permettent de synchroniser les données des serveurs jeu
   * avec celles qui persistent en DB.
   */
  public initConnection() {
    const ws = io(this.url, {
      auth: {
        identifier: env.get('GS_' + this.id + '_IDENTIFIER'),
        token: env.get('GS_' + this.id + '_TOKEN'),
      }
    });

    // Lorsque que le socket est connecté
    ws.on('connect', async () => {
      this.setOnline().then(() => console.log('Server ' + this.name + ' online !'))
    })

    // Lorsqu'il est déconnecté
    ws.on('disconnect', async () => {
      this.setOffline().then(() => console.log('Server ' + this.name + ' offline !'))
    })

    // Mettre à jour les lobbies
    ws.on('update', async (capacity: number, lobbies:  {uuid: string, game: string, status: 'waiting' | 'running' | 'finished', visibility: 'public' | 'private'}[]) => {
      this.capacity = capacity
      await this.save()

      const lobby: Lobby[] = await Lobby.query().where('server_id', this.id);
      lobby.forEach((lobby: Lobby) => {
        for (const _lobby of lobbies ) {
          if (_lobby.uuid == lobby.uuid) {
            lobby.game = _lobby.game
            lobby.statut = _lobby.status
            lobby.visibility = _lobby.visibility
            return lobby.save()
          }
        }

        lobby.delete()
      })
    })

    // Mettre à jour le statut du lobby
    ws.on('lobby_status', (uuid: string, statut: 'waiting' | 'running' | 'finished') => {
      Lobby.find(uuid).then((lobby) => lobby?.merge({statut: statut}).save())
    })

    // Suppression d'un lobby
    ws.on('delete lobby', (uuid: string) => {
      Lobby.query().where('uuid', uuid).delete() // cascade supprime la liste des joueurs dans la table user_lobbies
    })

    PTServerSockets.getInstance().registerSocket(this.id, ws)
  }

  /**
   * Permet de créer un lobby
   *
   * @param uuid
   * @param game
   * @param visibility
   * @param users utilisateurs à qui une réponse va être renvoyés.
   */
  public setupLobby(uuid: string, game: string, visibility: string, users: User[]) {
    const ws = PTServerSockets.getInstance().sockets.get(this.id)
    ws?.emit('create lobby', uuid, game, visibility, (error: any, response: any) => {
      if (error) {
        AdonisWS.io?.to('l' + uuid).emit('matchmaking_error', error)
      } else if (response.status == 200) {

        const lobby: Lobby = new Lobby()
        lobby.uuid = uuid
        lobby.server_id = this.id
        lobby.game = game
        lobby.statut = "waiting"
        lobby.visibility = "public"

        lobby.save().then(() => lobby.joinAllGrouped(users)
        )
      } else {
        AdonisWS.io?.to('l' + uuid).emit('matchmaking_error', {
          message: "Error response status."
        })
      }
    })
  }

  public async setOnline() {
    this.statut = 'online'
    return this.save()
  }

  public async setOffline() {
    this.statut = 'offline'
    return this.save()
  }
}
