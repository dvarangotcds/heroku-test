import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator"

@ValidatorConstraint({ name: "Log level", async: false })
export class IsLogLevel implements ValidatorConstraintInterface {
  private readonly logLevels: string[] = [
    "error",
    "warn",
    "info",
    "verbose",
    "debug",
    "silly"
  ]

  public validate(text: string, args: ValidationArguments) {
    return this.logLevels.indexOf(text) !== -1
  }

  public defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "Unrecognized log level: ($value)"
  }
}
