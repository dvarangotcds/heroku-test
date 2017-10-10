import { IsFQDN, IsInt, IsNotEmpty, IsString, Min, ValidateIf, ValidationError, Validator } from 'class-validator'
import IValidate from './ivalidate'
import { IValidationError, toErrorMessage } from './ivalidation_error'

export class Auth implements IValidate {
  public isValid: boolean

  @IsNotEmpty()
  @IsInt()
  @Min(300)
  public expiresInSeconds: number

  @IsNotEmpty()
  @IsString()
  public secret: string

  @IsInt()
  @Min(10)
  public saltingRounds: number

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
    this.expiresInSeconds = Number(process.env.TOKEN_EXPIRATION_SECONDS)
    this.secret = process.env.TOKEN_SECRET || ''
    this.saltingRounds = Number(process.env.BCRYPT_SALTING_ROUNDS)
  }
}
