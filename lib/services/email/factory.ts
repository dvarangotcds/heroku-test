//import email service
import { EmailService } from './email_service'

//import templates
import { SendValidateEmailTemplate } from './templates'

/**
 * The email factory.
 * @class EmailFactory
 */
export class EmailTemplateFactory {
  /**
   * Returns a new EmailService instance.
   * @method get emailService
   * @return {EmailService}
   */
  public static get emailService() {
    return new EmailService()
  }

  /**
   * Send a validate email address email.
   * @method get sendInviteEmailTemplate
   * @return {EmailService}
   */
  public static get validateEmail(): SendValidateEmailTemplate {
    return new SendValidateEmailTemplate()
  }
}
