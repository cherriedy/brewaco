import jwt from "jsonwebtoken";
import { z } from "zod";

import { authConfig } from "../../../config/app.js";
import { MissingEnvVarError } from "../../../errors/missing-env-var.error.js";
import { User } from "../../models/user.model.js";

const codeLength = authConfig.pwForgot.resetCode.length;
const validateResetCodeSchema = z.object({
  code: z
    .string({ message: "forgot-password.reset-code.mustBeNumber" })
    .length(codeLength, {
      message: "forgot-password.reset-code.passwordLength",
    }),
  email: z.email({ message: "auth.invalidEmail" }),
});

export type ValidateResetCodePayload = z.infer<typeof validateResetCodeSchema>;

export class ValidateResetCodeService {
  /**
   * Orchestrates the full reset code validation workflow:
   *  1. Validates the input payload structure and types using Zod.
   *  2. Checks if the user exists for the provided email.
   *  3. Verifies the reset code matches and is not expired.
   *  4. Generates and returns a temporary JWT token for password reset.
   *
   * @param data - Raw input containing email and reset code.
   * @returns An object with a signed JWT reset token.
   * @throws ZodError if input validation fails.
   * @throws Error if user is not found, code is invalid, or code is expired.
   */
  async validateResetCode(data: unknown): Promise<{ resetToken: string }> {
    const validatedData = this.validateResetCodePayload(data);
    await this.verifyResetCode(validatedData.email, validatedData.code);
    const resetToken = this.generateResetToken(validatedData.email);
    return { resetToken };
  }

  /**
   * Finds a user by their email address in the database.
   *
   * @param email - The email address of the user to search for.
   * @returns The User object if a user with the given email exists.
   * @throws Error if no user is found with the provided email address.
   */
  private async findUserByEmail(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    return user;
  }

  /**
   * Generates a temporary JWT token for password reset.
   *
   * The token includes the user's email and expires after a configured duration.
   * This token is intended for one-time use during the password reset flow.
   *
   * @param email - The email address of the user requesting a password reset.
   * @returns A signed JWT token for password reset.
   * @throws MissingEnvVarError if the JWT_SECRET environment variable is not defined.
   */
  private generateResetToken(email: string): string {
    // Ensure JWT_SECRET is defined and is a string
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== "string") {
      throw new MissingEnvVarError("JWT_SECRET");
    }
    // The expiry time for temporary reset token
    const expiresIn = authConfig.pwForgot.resetToken.expireIn;
    // Send the temporary token for password reset
    return jwt.sign({ email }, jwtSecret, {
      expiresIn: `${expiresIn}m`,
    });
  }

  /**
   * Validates the provided reset code data using the Zod schema.
   * Ensures the email format and reset code length are correct.
   *
   * @param data - The raw input data containing email and reset code.
   * @returns The validated and typed reset code payload.
   * @throws ZodError if validation fails due to incorrect email or code format.
   */
  private validateResetCodePayload(data: unknown): ValidateResetCodePayload {
    return validateResetCodeSchema.parse(data);
  }

  /**
   * Verifies the reset code for a user.
   *
   * Checks if the user exists, the reset code matches, and the code is not expired.
   *
   * @param email - The user's email address to verify.
   * @param code - The reset code provided by the user.
   * @throws Error if the user does not exist, the reset code is invalid, or the code has expired.
   */
  private async verifyResetCode(email: string, code: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    // The reset code is invalid
    if (!user.resetCode || user.resetCode !== code) {
      throw new Error("INVALID_CODE");
    }
    // The reset code has expired
    if (user.resetCodeExp && user.resetCodeExp < new Date()) {
      throw new Error("EXPIRED_CODE");
    }
  }
}
