import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator"

@ValidatorConstraint({ name: "Log level", async: false })
export class IsEnvironment implements ValidatorConstraintInterface {
  private readonly environments: string[] = [
    "development",
    "production",
    "test"
  ]

  public validate(text: string, args: ValidationArguments) {
    return this.environments.indexOf(text) !== -1
  }

  public defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "Unrecognized log level: ($value)"
  }
}
