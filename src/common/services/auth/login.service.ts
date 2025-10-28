import { User } from "#common/models/user.model.js";
import { comparePassword } from "#common/utils/hash-password.js";
import { MissingEnvVarError } from "#errors/missing-env-var.error.js";
import jwt from "jsonwebtoken";
import { authConfig } from "#config/app.js";
import { z } from "zod";
import { Role } from "../../../interfaces/role.interface.js";

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});
export type AuthCredentials = z.infer<typeof loginSchema>;

export class LoginService {
  /**
   * Validates the provided login data against the defined Zod schema.
   * Ensures the data contains a valid email and a non-empty password string.
   *
   * @param data - The raw login data object to validate (typically from a request body).
   * @returns The validated and typed login credentials.
   * @throws ZodError if the data does not conform to the schema (invalid email or missing fields).
   */
  private validateCredentials(data: unknown): AuthCredentials {
    return loginSchema.parse(data);
  }

  /**
   * Authenticates a user by verifying their email and password.
   * Looks up the user in the database using the provided email,
   * then compares the provided password with the stored hashed password.
   *
   * @param email - The user's email address.
   * @param password - The user's plaintext password.
   * @param allowedRoles - Optional array of roles that are allowed to log in. If provided, the user's role must be in this array.
   * @returns An object containing the user's id and role if authentication is successful.
   * @throws Error if the user is not found or the password is incorrect.
   * @throws Error with message "ROLE_NOT_ALLOWED" if the user's role is not in the allowedRoles array.
   */
  private async authenticateUser(
    email: string,
    password: string,
    allowedRoles?: Role[],
  ): Promise<{ id: string; role: string }> {
    // Find user by email in database
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }
    // Compare provided password with hashed password in database
    const match = await comparePassword(password, user.password);
    if (!match) throw new Error("INVALID_CREDENTIALS");

    // Check if user's role is allowed (if allowedRoles is specified)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      throw new Error("ROLE_NOT_ALLOWED");
    }

    return {
      id: user._id.toString(),
      role: user.role,
    };
  }

  /**
   * Generates a JWT token for the authenticated user.
   *
   * The token payload includes the user's ID and role.
   * The token is signed using the secret defined in the `JWT_SECRET` environment variable.
   * The token's expiration is set based on the `authConfig.expireIn` value (in hours).
   *
   * @param userId - The unique identifier of the user.
   * @param role - The user's role (e.g., "admin", "user").
   * @returns The signed JWT token as a string.
   * @throws MissingEnvVarError if the `JWT_SECRET` environment variable is not defined.
   */
  private generateToken(userId: string, role: string): string {
    // Ensure JWT_SECRET is defined and is a string
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== "string") {
      throw new MissingEnvVarError("JWT_SECRET");
    }
    // Generate JWT token with user ID and role, set expiration
    return jwt.sign({ id: userId, role }, jwtSecret, {
      expiresIn: `${authConfig.expireIn}h`,
    });
  }

  /**
   * Orchestrates the complete login process for a user.
   *
   * 1. Validates the incoming login data using a Zod schema to ensure correct structure and types.
   * 2. Authenticates the user by checking if the email exists and the password matches the stored hash.
   * 3. Generates a signed JWT token containing the user's ID and role, with an expiration time.
   *
   * @param data - The raw login data object, typically from an HTTP request body.
   * @param allowedRoles - Optional array of roles that are allowed to log in. If provided, the user's role must be in this array.
   * @returns An object containing the signed JWT token for the authenticated user.
   * @throws ZodError if the input data fails validation (e.g., invalid email format, missing fields).
   * @throws Error with message "INVALID_CREDENTIALS" if authentication fails (user not found or password mismatch).
   * @throws Error with message "ROLE_NOT_ALLOWED" if the user's role is not in the allowedRoles array.
   * @throws MissingEnvVarError if the JWT secret is not set in the environment variables.
   */
  async login(
    data: unknown,
    allowedRoles?: Role[],
  ): Promise<{ token: string }> {
    const validatedData = this.validateCredentials(data);
    const user = await this.authenticateUser(
      validatedData.email,
      validatedData.password,
      allowedRoles,
    );
    const token = this.generateToken(user.id, user.role);
    return { token };
  }
}
