import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import * as momentTimezone from 'moment-timezone'

@ValidatorConstraint({ name: 'IANA Timezone', async: false })
export class IsIANATzValidator implements ValidatorConstraintInterface {
  public validate(text: string, args: ValidationArguments) {
    return momentTimezone.tz.zone(text) != null
  }

  public defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Invalid IANA timezone: ($value)'
  }
}
