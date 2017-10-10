import { Facebook, FacebookApiException } from 'fb'
import { social } from '../config'
import { Order } from '../app/models'

export interface FBOptions {
  appId?: string
  logging?: boolean
  version?: string
  xfbml?: boolean
}

export class SocialHelper {
  private params: FBOptions
  private accessToken: string
  private FB: any
  private metadataTemplate = `
    <!DOCTYPE html>
    <meta property="fb:app_id" content="${social.fbAppId}">	
    <meta property="og:type" content="product" />
    <meta property="al:ios:url" content="{{iosUrl}}" />
    <meta property="og:title" content="{{title}}" />
    <meta property="og:image" content="{{imageURL}}" />
    <meta property="og:image:url" content="{{imageURL}}" />
    <meta property="og:image:secure_url" content="{{imageURL}}" />
    <meta property="og:description" content="{{description}}" />
    <meta property="og:image:width" content=540 />
    <meta property="og:image:height" content=540 />
  `

  constructor() {
    this.accessToken = ''
  }

  public init(options: FBOptions) {
    this.FB = new Facebook(options)
  }

  public async getUserInfo(accessToken: string): Promise<string> {
    this.FB.setAccessToken(accessToken)
    const response = await this.FB.api('/me', { fields: ['id'] })
    if (response['error']) {
      throw new Error(response.error)
    }
    return response.id
  }

  public getMetadataForOrders(order: Order): string {
    return this.metadataTemplate
      .replace(/{{iosUrl}}/g, `shizzal://order/${order.id}`)
      .replace(/{{imageURL}}/g, order.User.getProfileUrl())
      .replace(/{{title}}/g, `${order.User.getFullName()} is looking for an item!`)
      .replace(/{{description}}/g, order.message)
  }
}

export const socialHelper: SocialHelper = new SocialHelper()
