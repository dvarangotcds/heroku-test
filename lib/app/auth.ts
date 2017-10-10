import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import { verify } from 'jsonwebtoken'
import { auth as authConfig } from './../config'
import { logger, repository, tokensCache } from './../services'
import { ErrorPayload } from './error_payload'
import { User } from './models'

const authenticateRequest = [validateToken]

export { authenticateRequest }

export async function validateToken(request: Request, response: Response, next: NextFunction) {
  try {
    const token = extractAuthBearerToken(request)
    if (!token) return next()

    const id = await tokensCache.getUserIdAsync(token)

    if (!id) throw new Error('Invalid Token')

    const loggedUser = await repository.getUserAsync(id)
    if (!loggedUser) return response.status(403).json(new ErrorPayload(403, 'Invalid access token'))

    logger.info(`Logged user ${loggedUser.email} with email: ${loggedUser.email}`)
    response.locals.loggedUser = loggedUser
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

function extractAuthBearerToken(request: Request): string {
  const authHeader = request.header('authorization') || ''
  const token = authHeader.split(' ')[1]
  return token
}
