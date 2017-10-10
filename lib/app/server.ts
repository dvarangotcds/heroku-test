import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as expressWinston from 'express-winston'
import { createServer as createHttpServer, Server as httpServer } from 'http'
import { createServer as createHttpsServer, Server as httpsServer } from 'https'
import { logger } from '../services'
import healthChecker from './health_checker'
import { api } from './router'

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: '*/*' }))
app.use(express.static(__dirname + '/public'))
app.use('/api', api)
app.get('/health-check', healthChecker)

export default function listen(port: number): httpServer | httpsServer {
  const server = createHttpServer(app)
  server.listen(port)
  logger.info(`App is listening on port ${process.env.PORT}`)
  return server
}
