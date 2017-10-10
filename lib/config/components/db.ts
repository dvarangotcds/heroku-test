import {
  IsFQDN,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidationError,
  Validator
} from "class-validator"
import { IValidationError, toErrorMessage } from ".././ivalidation_error"
import IValidate from "./../ivalidate"

export default class Db implements IValidate {
  public isValid: boolean

  @IsNotEmpty()
  @IsString()
  public host: string | undefined

  @IsNotEmpty()
  @IsString()
  public name: string | undefined

  @IsNotEmpty()
  @IsString()
  public password: string | undefined

  @IsNotEmpty()
  @IsInt()
  public port: number

  @ValidateIf(x => x.url !== "" && x.url != null)
  @IsFQDN()
  public url: string | undefined

  @IsNotEmpty()
  @IsString()
  public user: string | undefined

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

  public getConnectionString(): string {
    // See https://www.postgresql.org/docs/current/static/libpq-connect.html#LIBPQ-CONNSTRING
    return `postgresql://${this.user}:${this.password}@${this.host}:${this
      .port}/${this.name}`
  }

  private setVariables() {
    this.host = process.env.DB_HOST
    this.name = process.env.DB_NAME
    this.password = process.env.DB_PASSWORD
    this.port = Number(process.env.DB_PORT)
    this.url = process.env.DB_URL
    this.user = process.env.DB_USER
  }
}
