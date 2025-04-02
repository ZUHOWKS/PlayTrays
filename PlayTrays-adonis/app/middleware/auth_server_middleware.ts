import type {HttpContext} from "@adonisjs/core/http";
import type {NextFn} from "@adonisjs/core/types/http";
import env from "#start/env";
import db from "@adonisjs/lucid/services/db";

export default class AuthServerMiddleware {

  /**
   * Vérifier les crédences de l'authentification d'un serveur jeu.
   *
   * @param request
   * @param response
   * @param next
   */
  async handle({request, response}: HttpContext, next: NextFn) {
    const authHeader = request.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {

      const [identifier, token] = authHeader.slice(7).split(':');

      if (identifier && token) {
        const servers = await db.from('pt_servers').count('* as total');

        for (let i: number = 1; i <= servers[0].total; i++) {

          if (env.get("GS_" + i + "_IDENTIFIER") === identifier && env.get("GS_" + i + "_TOKEN") === token) {
            return next()
          }
        }
      }
    }



    return response.abort("Error Middleware!")
  }
}
