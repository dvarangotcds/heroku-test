import { Validate, ValidationError, Validator, IsString, IsNotEmpty } from 'class-validator'
import { IValidationError, toErrorMessage } from '.././ivalidation_error'
import IValidate from './../ivalidate'

export default class Email implements IValidate {
  public isValid: boolean

  @IsString()
  @IsNotEmpty()
  public emailServiceAPIKey: string

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
    this.emailServiceAPIKey = process.env.SENDGRID_API_KEY + ''
  }
}
