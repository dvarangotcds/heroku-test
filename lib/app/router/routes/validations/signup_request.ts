import { ArrayMinSize, ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { minimumSignupKeywords } from '../../../../config'

export default class SignupRequest {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(minimumSignupKeywords)
  public keywords: string[]

  @IsNotEmpty()
  @IsEmail()
  public email: string

  @IsString()
  @IsNotEmpty()
  public password: string

  public firstName: string
  public s3Path: string
  public lastName: string
  public pictureURL: string

  constructor() {
    this.keywords = []
    this.password = ''
    this.email = ''
    this.firstName = ''
    this.lastName = ''
    this.s3Path = ''
    this.pictureURL = ''
  }
}
