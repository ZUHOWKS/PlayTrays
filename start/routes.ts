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


router.group(() => {
  router.group(() => {

    /*
        Register & Login Routes
     */
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])

    /*
        Logged routes
     */
    router.group(() => {

      router.group(() => {
        router.get('info', [UserController, 'info'])
      }).prefix('user')


    }).use(middleware.auth({
      guards: ['api']
    }))

  }).prefix('v1')
}).prefix('api')




