import { NextFunction, Request, Response } from 'express'
import { Point } from 'geojson'
import { deserialize } from 'json-typescript-mapper'
import * as moment from 'moment'
import * as momentTimezone from 'moment-timezone'
import { keywordsSuggester, logger, repository, socialHelper } from '../../services'
import { Order, User } from '../models'
import OrderRequest from '../router/routes/validations/order_request'
import { toOrderDTO } from '../json_replacers'
import { ErrorPayload } from './../error_payload'

export async function loadAsync(request: Request, response: Response, next: NextFunction, id: string) {
  try {
    const user = response.locals.loggedUser as User
    const order = await repository.getOrderAsync(id, user)
    if (!order) return response.status(404).json(new ErrorPayload(404, 'Order not found'))

    response.locals.order = order as Order
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function getAsync(request: Request, response: Response, next: NextFunction) {
  if (!response.locals.order) {
    response.status(400).json(new ErrorPayload(400, 'Order not found'))
  }

  response.status(200).json(toOrderDTO(response.locals.order))
}

export async function createOrderAsync(request: Request, response: Response, next: NextFunction) {
  const orderRequest = deserialize(OrderRequest, request.body) as OrderRequest
  const location: Point = {
    coordinates: orderRequest.location,
    type: 'Point'
  }
  const order: Order = new Order(
    orderRequest.keywords,
    orderRequest.message,
    orderRequest.canDeliver,
    location,
    moment.tz(orderRequest.dateFrom, orderRequest.timezone),
    moment.tz(orderRequest.dateTo, orderRequest.timezone),
    momentTimezone.tz.zone(orderRequest.timezone),
    'pending',
    response.locals.loggedUser as User
  )
  try {
    const newOrder = await repository.createOrderAsync(order, response.locals.loggedUser)
    logger.info(`Order created with id=${newOrder.id}`)
    response.status(200).json(toOrderDTO(order))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(400).send()
  }
}

export async function getUserOrdersAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.loggedUser as User
    let ordersPromise = await repository.getUserOrdersAsync(user, request.query)
    if (ordersPromise) {
      const orders = await Promise.all(ordersPromise)
      response.status(200).json(orders.map(x => toOrderDTO(x)))
    }
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function getFeedAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.loggedUser as User
    if (request.query.filter !== 'keywords') {
      const feed = await repository.getOrdersFeedAsync(user, request.query)
      response.status(200).json(feed.map(x => toOrderDTO(x)))
    } else {
      const keywordsOrders = await repository.getkeywordsInOrdersAsync(user, request.query)
      response.status(200).json(keywordsOrders)
    }
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function cancelOrderAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.loggedUser as User
    const order = await repository.cancelOrderAsync(response.locals.order, user)
    response.status(200).json(toOrderDTO(order))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function getOrderMetadataAsync(request: Request, response: Response, next: NextFunction) {
  const order = response.locals.order as Order
  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.end(socialHelper.getMetadataForOrders(order))
}
