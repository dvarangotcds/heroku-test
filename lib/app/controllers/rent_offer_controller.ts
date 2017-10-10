import { NextFunction, Request, Response, Router } from 'express'
import { repository, logger } from './../../services'
import { ErrorPayload } from './../error_payload'
import { User, RentOffer, Order, Item } from '../models'
import { toRentOfferDTO, toOrderDTO } from '../json_replacers'

const router = Router()

export async function loadAsync(request: Request, response: Response, next: NextFunction, id: string) {
  try {
    const user = response.locals.loggedUser as User
    const rentOffer = await repository.getRentOfferAsync(id, user)
    if (!rentOffer) return response.status(404).json(new ErrorPayload(404, 'Rent Offer not found'))

    response.locals.rentOffer = rentOffer as RentOffer
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function getAsync(request: Request, response: Response, next: NextFunction) {
  if (!response.locals.rentOffer) {
    response.status(400).json(new ErrorPayload(400, 'Rent Offer not found'))
  }

  response.status(200).json(toRentOfferDTO(response.locals.rentOffer))
}

export async function createRentOfferAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user: User = response.locals.loggedUser as User
    const rentOffer = await repository.createRentOfferAsync(
      {
        status: 'offered',
        ...request.body
      },
      user.id
    )
    response.status(200).json(toRentOfferDTO(rentOffer))
  } catch (error) {
    console.log(error)
    response.status(500).send()
  }
}

export async function getUserRentOffersAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user: User = response.locals.loggedUser as User
    const rentOffers = await repository.getUserRentOffersAsync(user, request.query)

    response.status(200).json(rentOffers.map(x => toRentOfferDTO(x)))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function rejectAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const rentOffer = await repository.rejectRentOfferAsync(response.locals.rentOffer)
    response.status(200).json(toRentOfferDTO(rentOffer))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function ignoreAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const rentOffer = await repository.ignoreRentOfferAysnc(response.locals.rentOffer)
    response.status(200).json(toRentOfferDTO(rentOffer))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function acceptAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const rentOffer = await repository.acceptRentOfferAsync(response.locals.rentOffer)

    response.status(200).json(toRentOfferDTO(rentOffer))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function replyRentOfferAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const rentOffer = await repository.replyRentOfferAsync(
      response.locals.rentOffer,
      request.body.itemId,
      request.body.amount
    )

    response.status(200).json(toRentOfferDTO(rentOffer))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function completeRentOfferAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const rentOffer = await repository.completeRentOfferAsync(response.locals.rentOffer.id)

    response.status(200).json(toRentOfferDTO(rentOffer))
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}

export async function getItemsInRentOffersAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user: User = response.locals.loggedUser as User
    const rentOffers = await repository.getItemsInRentOffersAsync(user, request.query)
    response.status(200).json(rentOffers)
  } catch (error) {
    logger.error((error as Error).message)
    response.status(500).send()
  }
}
