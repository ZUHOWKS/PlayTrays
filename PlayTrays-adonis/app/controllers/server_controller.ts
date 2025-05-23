import type {HttpContext} from '@adonisjs/core/http'
import PTServer from "#models/pt_server";
import env from "#start/env";
import User from "#models/user";
import {AccessToken} from "@adonisjs/auth/access_tokens";

export default class ServerController {
  ws: [] = []
  idTab: (string | undefined)[] = [env.get("GS_1_IDENTIFIER"), env.get("GS_2_IDENTIFIER")]

  /**
   * Manifester la présence du serveur jeu.
   * (Actualise l'état du serveur en DB)
   */
  async manifest({request, response}: HttpContext) {
    console.log("Manifesting the server...")
    const identifier = request.header('Authorization')?.split(' ')[1]?.split(':')[0];
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

  async legitUser({request, response}: HttpContext) {
    const {userID, userToken, lobbyUUID} = request.only(['userID', 'userToken', 'lobbyUUID']);

    if (userID && userToken && lobbyUUID) {
      const user: User | null = await User.find(Number(userID))

      if (user && (await user.getLobby())?.uuid == lobbyUUID) {
        const decodedToken = AccessToken.decode(userToken.substring(0, 4), userToken)
        if (decodedToken && (await (User.accessTokens.all(user)))[0].verify(decodedToken.secret)) {
          return response.ok('Authorized')
        }
      }
    }

    return response.abort('Error!')
  }

  async userInfo({request, response}: HttpContext) {
    const {userID} = request.only(['userID']);

    if (userID) {

      const _u: User | null = await User.find(userID)

      if (_u) {
        return {
          id: _u.id,
          username: _u.username,
        }
      }

    }

    return response.abort('Unauthorized')
  }
}
