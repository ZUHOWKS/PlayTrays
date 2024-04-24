import type {HttpContext} from '@adonisjs/core/http'
import User from "#models/user";

export default class UserController {
  async info({ auth }: HttpContext) {
    if (auth.isAuthenticated) {
      const user: User = auth.getUserOrFail();

      return {
        id: user.id,
        username: user.username,
        points: user.points,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
      }
    }

    return;
  }
}
