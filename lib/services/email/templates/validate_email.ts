//import the base email class
import { EmailTemplate } from './template'

/**
 * Validate email address email template.
 * @class SendValidateEmailTemplate
 */
export class SendValidateEmailTemplate extends EmailTemplate {
  //the first name of the person
  public firstName?: string = ''

  //the last name of the person
  public lastName?: string = ''

  //the email of the person being validated
  public emailAddress: string = ''

  //the validation code
  public validationCode?: string = ''

  /**
   * Returns the email subject.
   * @method get subject
   * @return {string}
   */
  public get subject(): string {
    return 'Welcome To Shizzal! Confirm Your Email'
  }

  /**
   * Returns the file name in the DIST_PATH directory for this template.
   * @method get fileName
   * @return {string}
   */
  public get fileName(): string {
    return ''
  }

  /**
   * Returns the html content for this template. 
   * Used when fileName is empty.
   * @method get fileName
   * @return {string}
   */
  public get htmlContent(): string {
    return `
      <h2>You're on your way!</h2>
      <p>Let's confirm your email address.</p>
      <p>By clicking on the following link, you are confirming your email address and agreeing to Shizzal's Terms of Service.</p>
      <br/>
      <p><a href='branch.io link with ${this.validationCode}'>Confirm email address</a></p>
    `
  }

  /**
   * Post-content hook.
   * @method post
   */
  public post() {
    //do nothing
  }

  /**
   * Pre-content hook.
   * @method pre
   */
  public pre() {
    //add custom substitutions
    //this.email.addSubstitution('-firstName-', this.firstName)
  }
}
