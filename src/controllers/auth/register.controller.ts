import { User } from "#models/user.model.js";
import { t } from "#utils/i18n.js";
import { apiError, apiSuccess } from "#utils/api-response.js";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { emailSchema, passwordSchema } from "#models/validation/validations.js";
import { handleZodError } from "#utils/zod-error-handler.js";

/**Schema for validating user registration data. Includes strict password requirements for security.*/
const registerSchema = z.object({
  address: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
      state: z.string().optional(),
      street: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
  email: emailSchema,
  name: z.string().min(1, { message: "registration.emptyName" }),
  password: passwordSchema,
  phone: z.string().optional(),
});

/**
 * Handles user registration by validating input, checking for existing users,
 * creating a new user record, and returning a success or error response.
 * @param req Express request object containing registration data
 * @param res Express response object for sending API responses
 * @returns Promise resolving when the registration process completes
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const locale = req.locale;
  try {
    // Validate request body
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      apiError(res, t("registration.duplicateEmail", locale), null, 409);
      return;
    }

    // Create and save new user
    const user = new User(data);
    await user.save();

    // Return success response with user ID
    apiSuccess(res, { userId: user._id }, t("registration.success", locale));
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }

    // Handle MongoDB duplicate key errors
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return apiError(res, t("registration.duplicateEmail", locale), null, 409);
    }

    // Handle other errors
    const errorMessage =
      error instanceof Error ? error.message : "Registration failed";
    apiError(res, t("registration.serverError", locale), errorMessage, 500);
  }
};
