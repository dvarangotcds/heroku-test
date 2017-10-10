import { Router } from 'express'
import controllers from '../../controllers'
import { authenticateRequest } from '../../auth'
import validations from './validations'

const router = Router()
const schemaValidator = new validations.SchemaValidator()
const notificationsController = controllers.notificationsController

router.get('/', authenticateRequest, notificationsController.getUserNotificationsAsync)
router.get('/:notificationId', authenticateRequest, notificationsController.getAsync)
router.param('notificationId', notificationsController.loadAsync)

export default router
