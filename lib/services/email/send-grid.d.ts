//import sendgrid
import * as SendGrid from 'sendgrid'

export interface SendGridResponse {
  statusCode: number
  body: string
  headers: string
}

export class SendGridMail extends SendGrid.mail.Mail {}
export class SendGridEmail extends SendGrid.mail.Email {}
export class SendGridContent extends SendGrid.mail.Content {}
export class SendGridPersonalization extends SendGrid.mail.Personalization {}
export class SendGridSubstitution extends SendGrid.mail.Content {}
