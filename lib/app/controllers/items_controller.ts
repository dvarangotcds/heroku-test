import { NextFunction, Request, Response } from 'express'
import { logger, repository } from '../../services'
import { Item, User } from '../models'
import { ErrorPayload } from './../error_payload'
import { toItemDTO } from '../json_replacers'

export async function loadAsync(request: Request, response: Response, next: NextFunction, id: string) {
  try {
    const user = response.locals.loggedUser
    const item = await repository.getItemAsync(id, user)
    if (!item) return response.status(404).json(new ErrorPayload(404, 'Item not found'))

    response.locals.item = item as Item
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function getAsync(request: Request, response: Response, next: NextFunction) {
  if (!response.locals.item) {
    response.status(400).json(new ErrorPayload(400, 'Item not found'))
  }

  response.status(200).json(toItemDTO(response.locals.item))
}

export async function createItemAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const item = await repository.createItemAsync(request.body, response.locals.loggedUser)
    response.status(200).json(toItemDTO(item))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(400).send()
  }
}

export async function getUserItemsAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.loggedUser as User
    const items = await repository.getUserItemsAsync(user, request.query)
    response.status(200).json(items.map(x => toItemDTO(x)))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function updateAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.loggedUser
    const itemQuery = response.locals.item
    if (itemQuery.User.id === user.id) {
      const item = await repository.updateItemAsync(response.locals.item, request.body, user)
      response.status(200).json(toItemDTO(item))
    } else {
      return response.status(422).json(new ErrorPayload(422, 'Item does not belong to the user'))
    }
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function removeItemAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const item = response.locals.item
    const user = response.locals.loggedUser
    if (item.User.id === user.id) {
      const pepe = await repository.removeItemAsync(item, user)
      return response.status(200).send()
    } else {
      return response.status(422).json(new ErrorPayload(422, 'Item does not belong to the user'))
    }
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}
