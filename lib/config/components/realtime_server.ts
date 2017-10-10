import {
  IsInt,
  IsNotEmpty,
  IsString,
  Validate,
  ValidationError,
  Validator
} from "class-validator"
import { IValidationError, toErrorMessage } from ".././ivalidation_error"
import IValidate from "./../ivalidate"

export default class RealtimeServer implements IValidate {
  public isValid: boolean

  @IsInt() public port: number

  @IsString()
  @IsNotEmpty()
  public path: string

  public async validateAsync(): Promise<IValidationError> {
    const validator = new Validator()
    this.setVariables()
    const errors = await validator.validate(this)
    const validationError = {
      failedConstraints: errors.map(c => toErrorMessage(c.constraints)),
      hasErrors: errors.length > 0,
      target: this.constructor.name
    }
    this.isValid = !validationError.hasErrors
    return validationError
  }

  public validate(): IValidationError {
    const validator = new Validator()
    this.setVariables()
    const errors = validator.validateSync(this)
    const validationError = {
      failedConstraints: errors.map(c => toErrorMessage(c.constraints)),
      hasErrors: errors.length > 0,
      target: this.constructor.name
    }
    this.isValid = !validationError.hasErrors
    return validationError
  }

  private setVariables() {
    this.port = Number(process.env.PORT)
    this.path = process.env.REALTIME_SERVER_PATH + ""
  }
}
