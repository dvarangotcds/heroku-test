import { IsFQDN, IsInt, IsNotEmpty, IsString, ValidateIf, ValidationError, Validator } from 'class-validator'
import { IValidationError, toErrorMessage } from '.././ivalidation_error'
import IValidate from './../ivalidate'

export default class IOS implements IValidate {
  public isValid: boolean

  @IsNotEmpty()
  @IsString()
  public p8FilePath: string | undefined

  @IsNotEmpty()
  @IsString()
  public teamId: string | undefined

  @IsNotEmpty()
  @IsString()
  public keyId: string | undefined

  @IsNotEmpty()
  @IsString()
  public bundleIdentifier: string | undefined

  @IsNotEmpty() public sandbox: boolean

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
    this.p8FilePath = process.env.IOS_P8_FILE_NAME
    this.teamId = process.env.IOS_TEAM_ID
    this.keyId = process.env.IOS_KEY_ID
    this.bundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER
    this.sandbox = Boolean(process.env.IOS_SANDBOX === 'true')
  }
}
