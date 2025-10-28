import { t } from "../../utils/i18n.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { handleZodError } from "../../utils/zod-error-handler.js";
import { RegisterService } from "../../services/auth/register.service.js";

const registerService = new RegisterService();

/**
 * Handles user registration by validating input, checking for existing users,
 * creating a new user record, and returning a success or error response.
 *
 * @param req Express request object containing registration data
 * @param res Express response object for sending API responses
 * @param next Express next function for error handling
 * @returns Promise resolving when the registration process completes
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const result = await registerService.register(req.body);
    apiSuccess(res, result, t("registration.success", locale));
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }

    // Handle user exists error
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return apiError(res, t("registration.duplicateEmail", locale), null, 409);
    }

    if (error instanceof Error) {
      next(error); // Propagate to the global error handler
    }
  }
};
