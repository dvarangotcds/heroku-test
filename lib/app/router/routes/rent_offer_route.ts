import { Router } from 'express'
import controllers from '../../controllers'
import { authenticateRequest } from '../../auth'
import validations from './validations'

const router = Router()
const schemaValidator = new validations.SchemaValidator()
const rentOfferController = controllers.rentOfferController

router.post(
  '/',
  authenticateRequest,
  schemaValidator.validateSchema(validations.RentOfferRequest),
  schemaValidator.onSchemaValidationError,
  rentOfferController.createRentOfferAsync
)

router.get('/', authenticateRequest, rentOfferController.getUserRentOffersAsync)
router.get('/feed', authenticateRequest, rentOfferController.getItemsInRentOffersAsync)
router.get('/:rentOfferId', authenticateRequest, rentOfferController.getAsync)
router.put('/:rentOfferId/reject', authenticateRequest, rentOfferController.rejectAsync)
router.put('/:rentOfferId/ignore', authenticateRequest, rentOfferController.ignoreAsync)
router.put('/:rentOfferId/accept', authenticateRequest, rentOfferController.acceptAsync)
router.post('/:rentOfferId/reply', authenticateRequest, rentOfferController.replyRentOfferAsync)
router.post('/:rentOfferId/complete', authenticateRequest, rentOfferController.completeRentOfferAsync)

router.param('rentOfferId', rentOfferController.loadAsync)

export default router
