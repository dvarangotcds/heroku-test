import { Router } from 'express'
import controllers from '../../controllers'
import { authenticateRequest } from '../../auth'
import validations from './validations'

const router = Router()
const schemaValidator = new validations.SchemaValidator()
const itemsController = controllers.itemsController

router.post(
  '/',
  authenticateRequest,
  schemaValidator.onSchemaValidationError,
  controllers.itemsController.createItemAsync
)

router.get('/', authenticateRequest, itemsController.getUserItemsAsync)
router.get('/:itemId', authenticateRequest, itemsController.getAsync)
router.put('/:itemId', authenticateRequest, itemsController.updateAsync)
router.delete('/:itemId', authenticateRequest, itemsController.removeItemAsync)
router.param('itemId', itemsController.loadAsync)

export default router
