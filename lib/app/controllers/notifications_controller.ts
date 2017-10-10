import { NextFunction, Request, Response, Router } from 'express'
import { repository, logger } from './../../services'
import { ErrorPayload } from './../error_payload'
import { User, Notification } from '../models'
import { toNotificationDTO } from '../json_replacers'

const router = Router()

export async function loadAsync(request: Request, response: Response, next: NextFunction, id: string) {
  try {
    const user = response.locals.user as User
    const notification = await repository.getNotificationAsync(id, user)
    if (!notification) return response.status(404).json(new ErrorPayload(404, 'Notification not found'))

    request.body.notification = notification as Notification
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function getAsync(request: Request, response: Response, next: NextFunction) {
  if (!response.locals.notification) {
    response.status(400).json(new ErrorPayload(400, 'Notification not found'))
  }

  response.status(200).json(toNotificationDTO(response.locals.notification))
}

export async function getUserNotificationsAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.loggedUser as User
    const orders = await repository.getUserNotificationsAsync(user, request.query)
    response.status(200).json(orders.map(x => toNotificationDTO(x)))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}
