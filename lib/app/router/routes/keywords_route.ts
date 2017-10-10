import { Router } from 'express'
import controllers from '../../controllers'
import validations from './validations'
import { authenticateRequest } from '../../auth'

const router = Router()
const schemaValidator = new validations.SchemaValidator()

const keywordsController = controllers.keywordsController

router.get('/popular', keywordsController.getPopularKeywordsAsync)
router.get('/minimum', keywordsController.minimumAmountOfKeywordsAsync)
router.get('/suggestion', authenticateRequest, keywordsController.getKeywordSuggestions)
router.get('/set', authenticateRequest, keywordsController.getSortedSet)

export default router
