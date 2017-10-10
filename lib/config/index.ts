import { Auth } from './auth'
import Common from './components/common'
import Db from './components/db'
import Logger from './components/logger'
import RealTimeServer from './components/realtime_server'
import RedisKeywords from './components/redis_keywords'
import RedisTokens from './components/redis_tokens'
import Server from './components/server'
import { IValidationError } from './ivalidation_error'
import Ios from './components/ios'
import Social from './components/social'
import Email from './components/email'

const auth = new Auth()
const common = new Common()
const db = new Db()
const logger = new Logger()
const realtimeServer = new RealTimeServer()
const redisKeywords = new RedisKeywords()
const redisTokens = new RedisTokens()
const server = new Server()
const ios = new Ios()
const social = new Social()
const email = new Email()

export async function validateAllAsync(): Promise<IValidationError[]> {
  return [
    await auth.validateAsync(),
    await common.validateAsync(),
    await db.validateAsync(),
    await logger.validateAsync(),
    await realtimeServer.validateAsync(),
    await redisKeywords.validateAsync(),
    await redisTokens.validateAsync(),
    await server.validateAsync(),
    await ios.validateAsync(),
    await social.validateAsync(),
    await email.validateAsync()
  ].filter(x => x.hasErrors)
}

export function validateAll(): IValidationError[] {
  return [
    auth.validate(),
    common.validate(),
    db.validate(),
    logger.validate(),
    realtimeServer.validate(),
    redisKeywords.validate(),
    redisTokens.validate(),
    server.validate(),
    ios.validate(),
    social.validate(),
    email.validate()
  ].filter(x => x.hasErrors)
}

const minimumSignupKeywords = Number(5)
const maxRentOffersToGenerate = Number(100)

const defaultProfilePicture = 'assets/profile_placeholder.png'

export {
  auth,
  common,
  db,
  logger,
  realtimeServer,
  redisKeywords,
  redisTokens,
  server,
  minimumSignupKeywords,
  maxRentOffersToGenerate,
  defaultProfilePicture,
  ios,
  social,
  email
}
