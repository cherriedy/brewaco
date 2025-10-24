import { User } from "#models/user.model.js";
import { t } from "#utils/i18n.js";
import logger from "#utils/logger.js";
import { apiError, apiSuccess } from "#utils/api-response.js";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authConfig } from "#config/app.js";
import { comparePassword } from "#utils/hash-password.js";
import { MissingEnvVarError } from "#errors/missing-env-var.error.js";

/** Login validation schema. Validates the structure and format of login request data */
const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

/**
 * Handles user authentication by verifying email and password credentials.
 * On successful authentication, issues a JWT token containing user ID and role.
 * Provides localized error messages for invalid credentials and validation issues.
 *
 * @param req - Express request object with email and password in the body
 * @param res - Express response object for sending JSON responses
 * @returns void - Responds with a JWT token on success or an error message on failure
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const locale = req.locale;
  try {
    const data = loginSchema.parse(req.body);

    // Find user by email in database
    const user = await User.findOne({ email: data.email });
    if (!user) {
      apiError(res, t("login.invalidCredentials", locale));
      return;
    }

    // Compare provided password with hashed password in database
    const match = await comparePassword(data.password, user.password);
    if (!match) {
      apiError(res, t("login.invalidCredentials", locale));
      return;
    }

    // Ensure JWT_SECRET is defined and is a string
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== "string") {
      throw new MissingEnvVarError("JWT_SECRET");
    }

    // Generate JWT token with user ID and role, set expiration
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: `${authConfig.expireIn}h`,
    });

    // Return success response with token
    apiSuccess(res, { token }, t("login.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: t(err.message, locale),
      }));
      apiError(res, t("validation", locale), validationErrors, 400);
    }

    // Handle other unexpected errors
    if (error instanceof Error) {
      logger.error(`Login error: ${error.message}`);
      apiError(res, t("serverError", locale), null, 500);
    }
  }
};
