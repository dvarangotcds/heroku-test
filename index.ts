import * as dotenv from 'dotenv'
import app from './lib/app'
import * as config from './lib/config'
import {keywordsSuggester, logger, tokensCache, apn, socialHelper } from './lib/services'
import {init as initDb} from './lib/services/db'

dotenv.config()

const errors = config.validateAll()
const logLevel = config.logger.isValid ? config.logger.level : "info"
logger.init(logLevel)

if (errors.length > 0){
  errors.forEach(error=> logger.error(`${error.target}: [${error.failedConstraints}]`))
}
else{
  if (!config.logger.enabled){
    logger.disable()
  }
  initDb()
  const baseServer =  app.start(config.server.port)
  apn.init()
  socialHelper.init({
    appId: config.social.fbAppId,
    logging: true,
    version: config.social.fbApiVersion,
    xfbml: true
  })
  //apn.send(4, 'hola viry',{},['337538a1e71cd873185b101973b122b55baac6fec814a903fcee6c943bd70392','1c3f4c58531fe6faba5521f4d97a469c04c4f8443a81bd49074f87115942a8df','7e83d03d3310389fc5898f2a4e2081f7aba22ff8f5249449c2178686c4f479a4','8f097de46056070b0d8eb1e3e9b4575cae9c3e9f22892ed24a6f432353de36b6'])
  tokensCache.init(config.redisTokens.host, config.redisTokens.port, config.redisTokens.password)
  keywordsSuggester.init(baseServer,
    config.realtimeServer.path,
    config.redisKeywords.port,
    config.redisKeywords.host,
    config.redisKeywords.password)
  keywordsSuggester.populateRedisWithKeywords()
}

