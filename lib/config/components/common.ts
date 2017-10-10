import { Validate, ValidationError, Validator, IsString, IsNotEmpty } from 'class-validator'
import { IValidationError, toErrorMessage } from '.././ivalidation_error'
import IValidate from './../ivalidate'
import { IsEnvironment } from './is_environment'
import Server from './server'

export default class Common implements IValidate {
  public isValid: boolean

  @Validate(IsEnvironment) public environment: string

  @IsString()
  @IsNotEmpty()
  public basePath: string | undefined

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
    this.environment = process.env.NODE_ENV + ''
    this.basePath = process.env.BASE_PATH + ''
  }
}
