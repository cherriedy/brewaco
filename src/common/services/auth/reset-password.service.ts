import jwt from "jsonwebtoken";
import { z } from "zod";

import { MissingEnvVarError } from "../../../errors/missing-env-var.error.js";
import { User } from "../../models/user.model.js";
import { passwordSchema } from "../../models/validation/auth.validation.js";
import { hashPassword } from "../../utils/hash-password.js";

const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  token: z.string(),
});
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;

export class ResetPasswordService {
  /**
   * Orchestrates the entire password reset workflow:
   * 1. Validates the incoming payload structure and password strength using Zod.
   * 2. Verifies the JWT reset token, ensuring it is valid, unexpired, and signed with the correct secret.
   * 3. Extracts the email from the token payload.
   * 4. Updates the password in the database after hashing, and clears any existing reset code and expiration.
   *
   * @param data - The raw reset password data, typically from a client request body.
   * @throws ZodError if the payload fails schema validation.
   * @throws MissingEnvVarError if the JWT secret is not configured.
   * @throws Error if the token is invalid, expired, or the user does not exist.
   */
  async resetPassword(data: unknown): Promise<void> {
    const validatedData = this.validateResetPasswordPayload(data);
    const email = this.verifyResetToken(validatedData.token);
    await this.updatePassword(email, validatedData.newPassword);
  }

  /**
   * Finds a user by their email address in the database.
   *
   * Utilizes the User model to search for a user document matching the provided email.
   *
   * @param email - The email address of the user to look up.
   * @returns The User object if a user with the given email exists.
   * @throws Error if no user is found with the specified email address.
   */
  private async findUserByEmail(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
  }

  /**
   * Updates the password in the database and clears any existing reset code and its expiration.
   *
   * 1. Finds the user by their email address.
   * 2. Hashes the new password before saving.
   * 3. Removes the reset code and its expiration to prevent reuse.
   *
   * @param email - The email address of the user whose password is being updated.
   * @param newPassword - The new plain-text password to be hashed and stored.
   * @returns A promise that resolves when the update is complete.
   * @throws Error if the user is not found or if saving fails.
   */
  private async updatePassword(
    email: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findUserByEmail(email);
    user.password = await hashPassword(newPassword);
    user.resetCode = undefined;
    user.resetCodeExp = undefined;
    await user.save();
  }

  /**
   * Validates the provided reset password payload using the defined Zod schema.
   * Ensures the payload contains a valid new password and a reset token.
   *
   * @param data - The raw reset password data to validate, typically from a request body.
   * @returns The validated and typed reset password payload.
   * @throws ZodError if the payload does not conform to the schema requirements.
   */
  private validateResetPasswordPayload(data: unknown): ResetPasswordPayload {
    return resetPasswordSchema.parse(data);
  }

  /**
   * Verifies the provided JWT reset token and extracts the associated email address.
   * Ensures the token is valid, not expired, and was signed with the correct secret.
   *
   * @param token - The JWT reset token received from the password reset request.
   * @returns The email address embedded in the token payload.
   * @throws Error if the token is invalid, malformed, or expired.
   * @throws MissingEnvVarError if the JWT_SECRET environment variable is not defined.
   */
  private verifyResetToken(token: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== "string") {
      throw new MissingEnvVarError("JWT_SECRET");
    }
    const decoded = jwt.verify(token, jwtSecret) as { email: string };
    return decoded.email;
  }
}
