import { Router } from 'express'
import controllers from '../../controllers'
import validations from './validations'
import { authenticateRequest } from '../../auth'

const router = Router()
const schemaValidator = new validations.SchemaValidator()
const usersController = controllers.usersController

router.post(
  '/',
  schemaValidator.validateSchema(validations.SignupRequest),
  schemaValidator.onSchemaValidationError,
  usersController.signupAsync,
  usersController.sendVerifyEmailAsync,
  usersController.createRefreshTokenAsync,
  usersController.generateTokenAsync
)

router.post('/token', usersController.checkRefreshTokenAsync, usersController.generateTokenAsync)
router.post('/login', usersController.loginAsync, usersController.generateTokenAsync)
router.post('/fblogin', usersController.fbLoginAsync, usersController.generateTokenAsync)
router.patch('/', authenticateRequest, usersController.addKeywordsAsync)
router.put('/', authenticateRequest, usersController.updateUserAsync)
router.get('/:userId', authenticateRequest, usersController.getAsync)
router.put('/:userId/deviceToken', authenticateRequest, usersController.addDeviceToken)
router.post('/:userId/logout', authenticateRequest, usersController.logout)
router.put('/verify', schemaValidator.validateSchema(validations.VerifyRequest), usersController.verifyEmailAsync)

router.param('userId', usersController.loadAsync)

export default router
