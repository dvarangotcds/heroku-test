import { IsNumber, IsNotEmpty, IsString } from 'class-validator'
import { minimumSignupKeywords } from '../../../../config'

export default class RentOfferRequest {
  @IsString()
  @IsNotEmpty()
  public itemId: string

  @IsString()
  @IsNotEmpty()
  public orderId: string

  @IsNumber()
  @IsNotEmpty()
  public amount: number

  constructor() {
    this.itemId = ''
    this.orderId = ''
    this.amount = 0
  }
}
