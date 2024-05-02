import {BaseModel, column} from "@adonisjs/lucid/orm";
import {io} from "socket.io-client";
import env from "#start/env";
import PTServerSockets from "../../src/modules/pt_server_sockets.js";


export default class PTServer extends BaseModel {

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare url: string

  @column()
  declare name: string

  @column()
  declare capacity: number

  @column()
  declare statut: string

  initConnection() {
    const ws = io("http://localhost:25525", {
      auth: {
        identifier: env.get('GS_' + this.id + '_IDENTIFIER'),
        token: env.get('GS_' + this.id + '_TOKEN'),
      }
    });

    ws.on('connect', async () => {
      this.statut = 'on'
      await this.save()
      console.log('Server ')
    })

    ws.on('disconnect', async () => {
      this.statut = 'off'
      await this.save()
      console.log('disconnect :(')
    })

    PTServerSockets.getInstance().registerSocket(this.id, ws)
  }
}
