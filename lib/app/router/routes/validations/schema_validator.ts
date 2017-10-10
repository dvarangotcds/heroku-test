import { ValidationError, Validator } from 'class-validator'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { deserialize, JsonProperty } from 'json-typescript-mapper'

type Constructor<T> = { new (): T }

export default class SchemaValidator {
  public validateSchema<T>(type: Constructor<T>): RequestHandler {
    const validator = new Validator()

    return (req: Request, res: Response, next: NextFunction) => {
      const input = deserialize(type, req.body)
      const errors = validator.validateSync(input)
      if (errors.length > 0) {
        next(errors)
      } else {
        req.body = input
        next()
      }
    }
  }

  public onSchemaValidationError(error: Error, request: Request, response: Response, next: NextFunction) {
    if (error instanceof Array && error[0] instanceof ValidationError) {
      const errorsMessages = error.map(x => `Error on ${x.property}: ${x.constraints[Object.keys(x.constraints)[0]]}`)
      response.status(400).json({ errors: errorsMessages }).end()
    } else {
      next(error)
    }
  }
}
