import { compare, genSalt, hash } from 'bcrypt'
import { NextFunction, Request, Response, Router } from 'express'
import { sign } from 'jsonwebtoken'
import * as randToken from 'rand-token'
import { auth as config } from './../../config'
import { logger, repository, tokensCache, socialHelper } from './../../services'
import { ErrorPayload } from './../error_payload'
import { User } from './../models'
import { EmailTemplateFactory, SendValidateEmailTemplate } from './../../services/email'
import * as crypto from 'crypto'

const router = Router()

export async function loadAsync(request: Request, response: Response, next: NextFunction, id: string) {
  try {
    logger.info(`Loading user with userId=${id}`)
    const user = await repository.getUserAsync(id)
    if (!user) return response.status(404).json(new ErrorPayload(404, 'User not found'))
    response.locals.user = user
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function signupAsync(request: Request, response: Response, next: NextFunction) {
  try {
    let users = await repository.findUsersAsync({ email: request.body.email })
    if (!users || users.length == 0) {
      const hashedPassword = await hash(request.body.password, config.saltingRounds)
      const token = crypto.randomBytes(16).toString('hex')
      const { email, firstName, lastName, s3Path, keywords, pictureURL, facebookId } = request.body
      const user = await repository.createUserAsync({
        email,
        first_name: firstName,
        last_name: lastName,
        password: hashedPassword,
        s3_path: s3Path,
        keywords,
        pictureURL,
        fb_id: facebookId,
        is_verified: false,
        token
      })
      response.locals.user = user

      next()
    } else {
      return response.status(422).json(new ErrorPayload(422, 'Email already in use'))
    }
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function updateUserAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const userLogged = response.locals.loggedUser as User
    if (userLogged) {
      const user = await repository.updateUserAsync(request.body, userLogged)
      response.locals.user = user
      logger.info(`Updated user with userId=${userLogged.id}`)
      return response.status(200).json(user)
    } else {
      return response.status(422).json(new ErrorPayload(422, 'Email already in use'))
    }
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function loginAsync(request: Request, response: Response, next: NextFunction) {
  const { email, password } = request.body

  try {
    const users = await repository.findUsersAsync({ email })

    if (!users || users.length == 0 || users.length > 1) {
      return response.status(404).json(new ErrorPayload(404, 'User not found'))
    }

    const user: User = users[0]

    if (!await compare(password, user.password)) {
      return response.status(401).json(new ErrorPayload(401, 'Invalid password'))
    }

    response.locals.user = user
    next()
  } catch (error) {
    logger.error(`Invalid login attempt for user: ${email}`)
    response.status(400).json(new ErrorPayload(400, 'Invalid credentials'))
  }
}

export async function fbLoginAsync(request: Request, response: Response, next: NextFunction) {
  const { facebookId, fbAccessToken } = request.body

  try {
    const id = await socialHelper.getUserInfo(fbAccessToken)

    if (id !== facebookId) throw ''

    const users = await repository.findUsersAsync({ fb_id: facebookId })

    if (!users || users.length == 0 || users.length > 1) {
      return response.status(404).json(new ErrorPayload(404, 'User not found'))
    }

    const user: User = users[0]

    response.locals.user = user
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, 'Invalid credentials'))
  }
}

export async function checkRefreshTokenAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const email = request.body.email
    const users = await repository.findUsersAsync({ email })
    if (!users || users.length == 0 || users.length > 1) throw Error('User not found')

    const user: User = users[0]
    response.locals.user = user
    const refreshToken = request.body.refreshToken

    if (await tokensCache.isValidRefreshTokenAsync(refreshToken, user)) {
      await tokensCache.deleteAccessTokenAsync(user)
      next()
    } else {
      response.sendStatus(401)
    }
  } catch (error) {
    logger.error(error as Error)
    response.status(400).json(new ErrorPayload(102, 'Invalid credentials'))
  }
}

export async function createRefreshTokenAsync(request: Request, response: Response, next: NextFunction) {
  const refreshToken = randToken.uid(256)
  const user: User = response.locals.user
  await tokensCache.saveOrReplaceRefreshTokenAsync(user, refreshToken)
  next()
}

export async function generateTokenAsync(request: Request, response: Response, next: NextFunction) {
  const user: User = response.locals.user
  const payload = { userId: user.id }

  try {
    const accessToken = sign(payload, config.secret)
    await tokensCache.saveAccessTokenAsync(`${user.id}`, accessToken)
    const refreshToken = (await tokensCache.getRefreshTokenAsync(user)) || ''
    const bodyResponse = { accessToken, refreshToken, user: user }

    response.status(200).json(bodyResponse)
  } catch (error) {
    response.status(500).json(new ErrorPayload(500, error.message))
  }
}

export async function addKeywordsAsync(request: Request, response: Response, next: NextFunction) {
  const user = response.locals.loggedUser as User
  try {
    const userUpdate = await repository.addKeywordsAsync(request.body.keywords, user)
    response.status(200).json(userUpdate)
  } catch (error) {
    logger.error(error as Error)
    response.status(400).send()
  }
}

export async function getAsync(request: Request, response: Response, next: NextFunction) {
  if (!response.locals.user) {
    response.status(400).json(new ErrorPayload(400, 'User not found'))
  }

  response.status(200).json(response.locals.user)
}

export async function addDeviceToken(request: Request, response: Response, next: NextFunction) {
  try {
    const logged = response.locals.loggedUser as User
    const user = response.locals.user as User

    if (logged && user && logged.id && user.id && logged.id.toString() === user.id.toString()) {
      const userUpdate = await repository.addDeviceToken(request.body.deviceToken, user)
      response.status(200).json(userUpdate)
    } else {
      response.status(401).json(new ErrorPayload(401, 'Unauthorized'))
    }
  } catch (error) {
    logger.error(error as Error)
    response.status(400).json(new ErrorPayload(40, error.message))
  }
}

export async function sendVerifyEmailAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const user = response.locals.user as User

    let template: SendValidateEmailTemplate = EmailTemplateFactory.validateEmail
    template.firstName = user.firstName
    template.lastName = user.lastName
    template.emailAddress = user.email
    template.validationCode = user.token
    template.email.addTo(user.email, user.getFullName().trim())
    await template.send()
    next()
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function verifyEmailAsync(request: Request, response: Response, next: NextFunction) {
  try {
    const users = await repository.findUsersAsync({ email: request.body.email })
    if (!users || users.length === 0) {
      return response.status(404).json(new ErrorPayload(404, 'We were unable to find a user for this email.'))
    }

    let user: User = users[0]

    if (user.isVerified) {
      return response.status(400).json(new ErrorPayload(400, 'This user has already been verified.'))
    }

    if (user.token !== request.body.token) {
      return response
        .status(400)
        .json(new ErrorPayload(400, 'We were unable to find a valid token. Your token my have expired.'))
    }

    user = await repository.updateUserAsync({ token: '', isVerified: true }, user)
    response.locals.user = user
    response.status(200).json(user)
  } catch (error) {
    response.status(400).json(new ErrorPayload(400, error.message))
  }
}

export async function logout(request: Request, response: Response, next: NextFunction) {
  try {
    const logged = response.locals.loggedUser as User
    const user = response.locals.user as User

    if (logged && user && logged.id && user.id && logged.id.toString() === user.id.toString()) {
      const userUpdate = await repository.removeDeviceToken(request.body.deviceToken, user)
      response.status(200).json(userUpdate)
    } else {
      response.status(401).json(new ErrorPayload(401, 'Unauthorized'))
    }
  } catch (error) {
    logger.error(error as Error)
    response.status(400).json(new ErrorPayload(40, error.message))
  }
}

export { router }
