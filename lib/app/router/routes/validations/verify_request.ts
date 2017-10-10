import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export default class SignupRequest {
  @IsNotEmpty()
  @IsEmail()
  public email: string

  @IsString()
  @IsNotEmpty()
  public token: string

  constructor() {
    this.email = ''
    this.token = ''
  }
}
