import { z } from "zod";

import { User } from "../../models/user.model.js";
import {
  emailSchema,
  passwordSchema,
} from "../../models/validation/auth.validation.js";

/**Schema for validating user registration data. Includes strict password requirements for security.*/
const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, { message: "registration.emptyName" }),
  phone: z.string().optional(),
  address: z
    .object({
      province: z.object({
        code: z.string().optional(),
        name: z.string().optional(),
      }).optional(),
      district: z.object({
        code: z.string().optional(),
        name: z.string().optional(),
      }).optional(),
      ward: z.object({
        code: z.string().optional(),
        name: z.string().optional(),
      }).optional(),
      detail: z.string().optional(),
    })
    .optional(),
});

export type Registration = z.infer<typeof registerSchema>;

export class RegisterService {
  /**
   * Orchestrates the complete user registration workflow.
   *
   * 1. Validates the incoming registration data using the strict Zod schema.
   * 2. Checks if a user with the provided email already exists in the database to enforce uniqueness.
   * 3. If the email is unique, creates and persists a new user record.
   *
   * @param data - Raw registration data, potentially from an untrusted source (e\.g\. HTTP request body\).
   * @returns An object containing the unique identifier (`userId`) of the newly created user.
   * @throws ZodError if validation fails (invalid or missing fields, schema violations\).
   * @throws Error with code "USER_EXISTS" if a user with the given email already exists.
   */
  async register(data: unknown): Promise<{ userId: string }> {
    const validatedData = this.validateRegistrationData(data);

    const exists = await this.isEmailRegistered(validatedData.email);
    if (exists) {
      throw new Error("USER_EXISTS");
    }

    const userId = await this.createUser(validatedData);
    return { userId };
  }

  /**
   * Persists a new user record in the database.
   *
   * Assumes the input data has already passed validation and contains all required fields.
   * Utilizes the User model to create and save the user document.
   *
   * @param data - Strongly typed and validated registration data for the new user.
   * @returns Promise<string> - Resolves to the unique identifier of the newly created user.
   * @throws Error if saving the user fails due to database issues.
   */
  private async createUser(data: Registration): Promise<string> {
    const user = new User(data);
    await user.save();
    return user._id.toString();
  }

  /**
   * Determines whether a user account with the specified email address already exists in the database.
   * Useful for preventing duplicate registrations and enforcing unique email constraints.
   *
   * @param email - The email address to search for in the user collection.
   * @returns Promise<boolean> - Resolves to true if a user with the given email exists, false otherwise.
   */
  private async isEmailRegistered(email: string): Promise<boolean> {
    const existing = await User.findOne({ email });
    return !!existing; // Return true if user exists, false otherwise
  }

  /**
   * Validates the provided registration data using the defined Zod schema.
   * Ensures all required fields and password/email constraints are met.
   *
   * @param data - Raw registration data (maybe untrusted user input)
   * @returns Registration - Strongly typed, validated registration data
   * @throws ZodError if validation fails (invalid or missing fields, schema violations)
   */
  private validateRegistrationData(data: unknown): Registration {
    return registerSchema.parse(data);
  }
}
