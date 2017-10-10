import { Router } from 'express'
import { authenticateRequest } from '../auth'
import routes from './routes'

const api = Router()

api.use('*', authenticateRequest)

api.use('/notifications', routes.notifications)
api.use('/orders', routes.orders)
api.use('/users', routes.users)
api.use('/keywords', routes.keywords)
api.use('/items', routes.items)
api.use('/rentoffers', routes.rent_offer)

export { api }
