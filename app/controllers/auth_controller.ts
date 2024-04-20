import type { HttpContext } from '@adonisjs/core/http'
import {Database} from "@adonisjs/lucid/database";
import User from "#models/user";
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  public async index(){
    return User.all()
  }
  async register({ request, response}: HttpContext) {
    const { email, username, password, passwordConfirmed } = request.only(['email', 'username', 'password', 'passwordConfirmed']);
    /**
     * Gestion d'erreur multiples de saisie
     */
    if (!email) return response.abort('Please enter an email address')

    else if (!password) return response.abort('Please a password')

    else if (password !== passwordConfirmed) return response.abort('The passwords must be the same.')

   /**
   * Find a user by email. Return error if a user does
   * not exists
   */
    const user = await User.findBy('email', email)

    if (user) {
      return response.abort('The user already exists.')
    } else {
      await User.create({
        email: email,
        username: username,
        password: password,
        points: 0})
      return User.all()
    }
  }
  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    /**
     * Find a user by email. Return error if a user does
     * not exists
     */
    const user = await User.findBy('email', email)
    if (!user) {
      return response.abort('Invalid credentials')
    }

    /**
     * Verify the password using the hash service
     */
    await hash.verify(user.password, password)

    const token = await User.accessTokens.create(user)

    return {
      type: 'bearer',
      value: token.value!.release(),
    }
  }
}


