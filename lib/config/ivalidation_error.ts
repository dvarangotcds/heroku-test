export interface IValidationError {
  target: string
  failedConstraints: string[]
  hasErrors: boolean
}

export function toErrorMessage(constraint: { [type: string]: string }): string {
  return constraint[Object.keys(constraint)[0]]
}
