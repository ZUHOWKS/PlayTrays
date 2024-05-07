import type {HttpContext} from '@adonisjs/core/http'
import User from "#models/user";
import {FriendInterface, UserInterface} from "../modules/utils/UserInterface.js";
import Lobby from "#models/lobby";
import PTServer from "#models/pt_server";
import {LobbyInterface} from "../modules/utils/LobbyInterface.js";


export default class UserController {
  async info({ auth }: HttpContext) {
    if (auth.isAuthenticated) {
      const user: User = auth.getUserOrFail();

      return {
        id: user.id,
        username: user.username,
        points: user.points,
        updatedAt: user.updatedAt?.toString(),
        createdAt: user.createdAt.toString()
      } as UserInterface
    }

    return;
  }

  /**
   * Demande d'ami en utilisant l'email.
   *
   * @param auth
   * @param request
   * @param response
   */
  async inviteFriend({ auth, request, response }: HttpContext) {
    if (auth.isAuthenticated) {
      const { email } = request.only(['email'])
      if (email) {
        const userToInvite: User | null = await User.findBy('email', email)

        if (userToInvite) {
          const u: User | null = auth.getUserOrFail();

          if (!(await u.isFriend(userToInvite)) && userToInvite.id != u.id) {
            await u.friendInvitation(userToInvite)
          }

          return response.ok('Friend invitation send to ' + userToInvite.username)
        }
      }
    }

    return response.abort('Unauthorized!')
  }

  /**
   * Accepter une demande d'ami via l'id de l'utilisateur
   *
   * @param auth
   * @param request
   * @param response
   */
  async acceptFriend({ auth, request, response }: HttpContext) {
    const { id } = request.only(['id'])

    if (id) {
      const userToAccept: User | null = await User.find(id)

      if (userToAccept) {
        await auth.getUserOrFail().friendAccept(userToAccept)
        return response.ok('Invite accepted !')
      }
    }

    return response.abort('Unauthorized!')
  }

  /**
   * Get la liste des amis
   *
   * @param auth
   * @param request
   * @param response
   */
  async friends({ auth }: HttpContext){
    if (auth.isAuthenticated) {
      const user: User = auth.getUserOrFail()
      const friendList: FriendInterface[] = [];
      const _users: User[] = await user.friends()

      _users.forEach((_u: User) => {
        friendList.push({
          id: _u.id,
          username: _u.username,
          online: false,
          status: "Offline"
        } as FriendInterface)
      })
      return friendList
    }
  }

  /**
   * Get les demandes d'amis.
   *
   * @param auth
   * @param request
   * @param response
   */
  async friendInvite({ auth }: HttpContext){
    if (auth.isAuthenticated) {
      const user: User = auth.getUserOrFail()
      const friendList: FriendInterface[] = [];
      const _users: User[] = await user.getFriendInvite()

      _users.forEach((_u: User) => {
        friendList.push({
          id: _u.id,
          username: _u.username,
          online: false,
          status: "Offline"
        } as FriendInterface)
      })

      return friendList
    }
  }

  /**
   * Get ses propres demande en ami.
   *
   * @param auth
   */
  async ownFriendInvite({ auth }: HttpContext){
    if (auth.isAuthenticated) {
      const user: User = auth.getUserOrFail()
      const friendList: FriendInterface[] = [];
      const _users: User[] = await user.getOwnFriendInvite()

      _users.forEach((_u: User) => {
        friendList.push({
          id: _u.id,
          username: _u.username,
          online: false,
          status: "Offline"
        } as FriendInterface)
      })

      return friendList
    }
  }

  async getLobby({ auth, response }: HttpContext) {
    if (auth.isAuthenticated) {
      const _l: Lobby | null = await auth.getUserOrFail().getLobby()
      if (_l) {
        return ({
          lobby: _l.uuid,
          game: _l.game,
          serverURL: (await PTServer.find(_l.server_id))?.url
        } as LobbyInterface)
      }
    }

    response.abort('Unauthorized!')
  }
}
