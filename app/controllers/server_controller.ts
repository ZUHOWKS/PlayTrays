import type {HttpContext} from '@adonisjs/core/http'
import PTServer from "#models/pt_server";
import env from "#start/env";

export default class ServerController {
  ws: [] = []
  idTab: (string | undefined)[] = [env.get("GS_1_IDENTIFIER"), env.get("GS_2_IDENTIFIER")]

  /**
   * Manifester la présence du serveur jeu.
   * (Actualise l'état du serveur en DB)
   */
  async manifest({request, response}: HttpContext) {
    const { identifier }: {identifier: string} = request.only(['identifier'])
    const idInTab: number = this.idTab.indexOf(identifier) + 1

    if (idInTab > 0 && this.idTab[idInTab-1]) {
      const server: PTServer | null = await PTServer.find(idInTab)

      if (server) {
        server.initConnection();

        return response.ok("Logged to the App Server !");
      }
    }

    return response.abort("Error!");
  }
}
