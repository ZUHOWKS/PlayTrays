/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import { middleware } from '#start/kernel'
import UserController from "#controllers/user_controller";
import ServerController from "#controllers/server_controller";

router.group(() => {

  /**
   * REST API V1
   * (/api/v1)
   *
   */
  router.group(() => {

    /*
        Register & Login routes
     */
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])

    /*
        Logged routes
        (/api/v1/user)
     */
    router.group(() => {

      router.group(() => {
        router.get('info', [UserController, 'info'])
        router.get('friends', [UserController, 'friends'])
      }).prefix('user')

      router.group(() => {
        router.post('invite', [UserController, 'inviteFriend'])
        router.post('accept', [UserController, 'acceptFriend'])
        router.get('own-invitations', [UserController, 'ownFriendInvite'])
        router.get('invitations', [UserController, 'friendInvite'])
      }).prefix('friend')

    }).use(middleware.auth({
      guards: ['api']
    }))

    /*
        Server routes
        (/api/v1/server)
     */
    router.group(() => {
      router.post('manifest', [ServerController, 'manifest'])
    }).prefix('server')
      .use(middleware.authServer())

  }).prefix('v1')
}).prefix('api')




