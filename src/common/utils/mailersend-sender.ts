import { EmailSender } from "#interfaces/email-sender.interface.js";
import logger from "#common/utils/logger.js";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { MissingEnvVarError } from "../../errors/missing-env-var.error.js";

/**
 * MailerSendSender implements the EmailSender interface using the MailerSend API.
 * It loads API credentials from environment variables and provides a method to send emails.
 */
export class MailerSendSender implements EmailSender {
  private readonly mailer: MailerSend;
  private readonly sentFrom: string;
  private readonly appName: string;

  constructor() {
    // Load API key from environment
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey) {
      throw new MissingEnvVarError("MAILERSEND_API_KEY");
    }

    // Load sender email address from environment
    const from = process.env.MAILERSEND_FROM;
    if (!from) {
      throw new MissingEnvVarError("MAILERSEND_FROM");
    }

    const appName = process.env.APP_NAME;
    if (!appName) {
      throw new MissingEnvVarError("APP_NAME");
    }

    this.mailer = new MailerSend({ apiKey: apiKey });
    this.sentFrom = from;
    this.appName = appName;
  }

  /**
   * Sends an email using the MailerSend API.
   * @param to - Recipient email address
   * @param subject - Email subject line
   * @param htmlContent - HTML content of the email body
   * @returns Promise that resolves when the email is sent
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    const sentFrom = new Sender(this.sentFrom, this.appName);
    const recipients = [new Recipient(to)];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(htmlContent);

    await this.mailer.email
      .send(emailParams)
      .then((response) => logger.info(response))
      .catch((error: unknown) => {
        const mailerErr = this.beautifyErr(error);
        throw new Error(mailerErr);
      });
  }

  private beautifyErr(error: unknown): string {
    let formatted = "";
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      "body" in error
    ) {
      const statusCode = (error as any).statusCode;
      formatted += `MailerSend Error with code ${statusCode}:\n`;

      const body = (error as any).body;
      if (body.message) formatted += `${body.message}\n`;
      if (body.errors) {
        for (const [field, messages] of Object.entries(body.errors)) {
          formatted += `${field}:\n`;
          for (const msg of messages as string[]) {
            formatted += `  - ${msg}\n`;
          }
        }
      }
    }
    return formatted;
  }
}
