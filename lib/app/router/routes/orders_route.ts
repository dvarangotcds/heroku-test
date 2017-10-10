import { Router } from 'express'
import controllers from '../../controllers'
import { authenticateRequest } from '../../auth'
import validations from './validations'

const router = Router()
const schemaValidator = new validations.SchemaValidator()
const ordersController = controllers.ordersController

router.post(
  '/',
  authenticateRequest,
  schemaValidator.validateSchema(validations.OrderRequest),
  schemaValidator.onSchemaValidationError,
  controllers.ordersController.createOrderAsync
)

router.get('/', authenticateRequest, ordersController.getUserOrdersAsync)
router.get('/feed', authenticateRequest, ordersController.getFeedAsync)
router.put('/:orderId/cancel', authenticateRequest, ordersController.cancelOrderAsync)
router.get('/:orderId/metadata', ordersController.getOrderMetadataAsync)
router.get('/:orderId', authenticateRequest, ordersController.getAsync)

router.param('orderId', ordersController.loadAsync)

export default router
