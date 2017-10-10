import { IsFQDN, IsInt, IsNotEmpty, IsString, ValidateIf, ValidationError, Validator } from 'class-validator'
import { IValidationError, toErrorMessage } from '.././ivalidation_error'
import IValidate from './../ivalidate'

export default class Social implements IValidate {
  public isValid: boolean

  @IsNotEmpty()
  @IsString()
  public fbAppId: string | undefined

  @IsNotEmpty()
  @IsString()
  public fbApiVersion: string | undefined

  @IsNotEmpty()
  @IsString()
  public fbAppSecret: string | undefined

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
    this.fbApiVersion = process.env.FB_API_VERSION || 'v2.10'
    this.fbAppId = process.env.FB_APP_ID || '289662328045984'
    this.fbAppSecret = process.env.FB_APP_SECRET || '2589f669c403026b309a72dacf90c193'
  }
}
