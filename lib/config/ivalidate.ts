import { ValidationError } from "class-validator"
import { IValidationError, toErrorMessage } from "./ivalidation_error"

export default interface IValidate {
  isValid: boolean
  validateAsync(): Promise<IValidationError>
  validate(): IValidationError
}
