import { DeviceContext } from "#interfaces/device-context.interface.js";
import { EmailSender } from "#interfaces/email-sender.interface.js";
import { TemplateEngine } from "#interfaces/template-engine.interface.js";
import crypto from "crypto";
import { z } from "zod";

import { authConfig } from "../../../config/app.js";
import { User } from "../../models/user.model.js";
import { emailSchema } from "../../models/validation/auth.validation.js";

const forgotPasswordSchema = z.object({ email: emailSchema });

export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;

export class ForgotPasswordService {
  constructor(
    private templateEngine: TemplateEngine,
    private emailSender: EmailSender,
  ) {}

  /**
   * Orchestrates the entire forgot password workflow for a user.
   *  1. Validates the incoming payload to ensure a proper email format.
   *  2. Checks if a user exists for the provided email, throwing "USER_NOT_FOUND" if absent.
   *  3. Generates a secure, time-limited reset code.
   *  4. Persists the reset code and its expiration to the user's record.
   *  5. Sends a password reset email containing the code and device context information.
   *
   * @param data - Raw payload from the client, expected to contain an email.
   * @param emailData - Contextual information (device, location, date) for the email template.
   * @param emailSubject - Subject line for the password reset email.
   * @throws ZodError - If payload validation fails (invalid or missing email).
   * @throws Error - If no user is found for the provided email.
   */
  async forgotPassword(
    data: unknown,
    emailData: DeviceContext,
    emailSubject: string,
  ): Promise<void> {
    const validatedData = this.validateForgotPasswordPayload(data);
    await this.findUserByEmail(validatedData.email);

    const { code, expiresAt } = this.generateResetCode();
    await this.saveResetCode(validatedData.email, code, expiresAt);
    await this.sendResetEmail(
      validatedData.email,
      code,
      emailData,
      emailSubject,
    );
  }

  /**
   * Finds a user by their email address in the database.
   * This method queries the `User` model for a document matching the provided email.
   * If no user is found, it throws an error with the code "USER_NOT_FOUND".
   *
   * @param email - The email address to search for in the user collection.
   * @returns The user object if found.
   * @throws Error - Throws "USER_NOT_FOUND" if no user exists with the given email.
   */
  private async findUserByEmail(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    return user;
  }

  /**
   * Generates a numeric reset code and sets its expiration time.
   * The code length and expiration are configurable via `authConfig`.
   * The reset code is a random integer of the specified length.
   *
   * @returns An object containing:
   *   - `code`: The generated reset code as a string.
   *   - `expiresAt`: The expiration date/time for the reset code.
   */
  private generateResetCode(): { code: string; expiresAt: Date } {
    const codeLength = authConfig.pwForgot.resetCode.length;
    const codeExpire = authConfig.pwForgot.resetCode.expire;

    const code = crypto
      .randomInt(10 ** (codeLength - 1), 10 ** codeLength - 1)
      .toString();

    const expiresAt = new Date(Date.now() + codeExpire * 60 * 1000);

    return { code, expiresAt };
  }

  /**
   * Updates the user's record with a new password reset code and its expiration time.
   *
   *  - Retrieves the user by email.
   *  - Sets the user's `resetCode` and `resetCodeExp` fields.
   *  - Persists the changes to the database.
   *
   * @param email - The user's email address to identify the account.
   * @param code - The generated password reset code to store.
   * @param expiresAt - The expiration date/time for the reset code.
   * @throws Error - If the user is not found in the database.
   */
  private async saveResetCode(email: string, code: string, expiresAt: Date) {
    const user = await this.findUserByEmail(email);
    user.resetCode = code;
    user.resetCodeExp = expiresAt;
    await user.save();
  }

  /**
   * Sends a password reset email containing the reset code to the user.
   *
   * This method renders the email template with contextual variables and dispatches the email.
   *
   * @param email - The recipient user's email address.
   * @param code - The generated password reset code to include in the email.
   * @param deviceContext - Contextual information about the device/location/date of the request.
   * @param subject - The subject line for the password reset email.
   * @returns Promise<void> - Resolves when the email is successfully sent.
   */
  private async sendResetEmail(
    email: string,
    code: string,
    deviceContext: DeviceContext,
    subject: string,
  ): Promise<void> {
    const codeExpire = authConfig.pwForgot.resetCode.expire;

    const variables: Record<string, string> = {
      code,
      codeExpiryMinutes: codeExpire.toString(),
      date: deviceContext.date,
      device: deviceContext.device,
      location: deviceContext.location,
    };

    // Render the HTML email template with variables
    const htmlContent = await this.templateEngine.render(
      "forgot-password",
      variables,
    );

    // Send the forgot password email with the reset code
    await this.emailSender.sendEmail(email, subject, htmlContent);
  }

  /**
   * Validates the forgot password request payload using the defined Zod schema.
   * Ensures the provided data contains a valid email address structure.
   *
   * @param data - The raw payload received from the client (typically from a form submission).
   * @returns The parsed and validated forgot password payload with a guaranteed email property.
   * @throws ZodError if the payload does not match the expected schema (e.g., missing or invalid email).
   */
  private validateForgotPasswordPayload(data: unknown): ForgotPasswordPayload {
    return forgotPasswordSchema.parse(data);
  }
}
