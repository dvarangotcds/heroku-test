import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import * as moment from 'moment'

@ValidatorConstraint({ name: 'ISO Date string', async: false })
export class IsISODateString implements ValidatorConstraintInterface {
  public validate(text: string, args: ValidationArguments) {
    return moment(text).isValid()
  }

  public defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Invalid ISO 8601 date string: ($value)'
  }
}
