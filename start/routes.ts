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
import User from '#models/user'
import { middleware } from '#start/kernel'
/*
router.get('/', async () => {
    return {hello:'world'}
})
*/

router.post('api/test', async ({ auth }) => {
  console.log(auth)
  console.log(auth.user) // User
  console.log(auth.authenticatedViaGuard) // 'api'
  console.log(auth.user!.currentAccessToken) // AccessToken
})


router.post('api/register', [AuthController, 'register'])

router.post('api/login', [AuthController, 'login'])
