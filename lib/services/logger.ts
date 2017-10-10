import { ConsoleTransportInstance, Logger as wsLogger, LoggerInstance, LoggerOptions, transports } from 'winston'

export class Logger {
  private logger: LoggerInstance
  private consoleTransport: ConsoleTransportInstance

  public init(level: string) {
    this.consoleTransport = new transports.Console({
      colorize: true,
      level,
      timestamp: () => new Date().toISOString()
    })
    this.logger = new wsLogger({
      transports: [this.consoleTransport]
    })
  }

  public info(message: string | object) {
    if (typeof message === 'string') {
      this.logger.info(message)
    } else {
      this.logger.info(JSON.stringify(message))
    }
  }

  public error(message: string | object) {
    if (typeof message === 'string') {
      this.logger.error(message)
    } else {
      this.logger.error(JSON.stringify(message))
    }
  }

  public disable() {
    this.logger.remove(this.consoleTransport)
  }
}

export const logger: Logger = new Logger()
