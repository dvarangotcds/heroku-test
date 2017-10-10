import { IsFQDN, IsInt, IsNotEmpty, IsString, Validate, ValidationError, Validator } from 'class-validator'
import { IValidationError, toErrorMessage } from '.././ivalidation_error'
import IValidate from './../ivalidate'

export default class RedisTokens implements IValidate {
  public isValid: boolean

  @IsInt() public port: number

  @IsString()
  @IsNotEmpty()
  public host: string

  @IsString()
  @IsNotEmpty()
  public password: string

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
    this.port = Number(process.env.REDIS_TOKENS_PORT)
    this.host = process.env.REDIS_TOKENS_HOST + ''
    this.password = process.env.REDIS_TOKENS_PASSWORD + ''
  }
}
