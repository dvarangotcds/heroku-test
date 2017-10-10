import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsString, Validate } from 'class-validator'
import * as momentTimezone from 'moment-timezone'
import { IsIANATzValidator } from './is_iana_tz_validator'
import { IsISODateString } from './is_iso_date_string_validator'

export default class OrderRequest {
  @IsArray()
  @ArrayNotEmpty()
  public keywords: string[]

  @IsString()
  @IsNotEmpty()
  public message: string

  @IsBoolean() public canDeliver: boolean

  @IsArray()
  @ArrayNotEmpty()
  public location: number[]

  @Validate(IsISODateString) public dateFrom: string

  @Validate(IsISODateString) public dateTo: string

  @Validate(IsIANATzValidator) public timezone: string

  constructor() {
    this.keywords = []
    this.message = ''
    this.canDeliver = false
    this.location = []
    this.dateFrom = ''
    this.dateTo = ''
    this.timezone = momentTimezone.tz.guess()
  }
}
