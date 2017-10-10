import {
  IsBoolean,
  IsString,
  Validate,
  ValidationError,
  Validator
} from "class-validator"
import { IValidationError, toErrorMessage } from ".././ivalidation_error"
import IValidate from "./../ivalidate"
import { IsLogLevel } from "./is_log_level"

export default class Logger implements IValidate {
  public isValid: boolean

  @IsBoolean() public enabled: boolean = true

  @Validate(IsLogLevel) public level: string

  public async validateAsync(): Promise<IValidationError> {
    const validator = new Validator()
    // const isLogEnabled = validator.isBooleanString(process.env.LOG_ENABLED + '')
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
    // const isLogEnabled = validator.isBooleanString(process.env.LOG_ENABLED + '')
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
    this.level = process.env.LOG_LEVEL + ""
  }
}
