import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import logger from "../../utils/logger.js";
import { ResetPasswordService } from "../../services/auth/reset-password.service.js";
import { StatusCodes } from "http-status-codes";
import { handleZodError } from "../../utils/zod-error-handler.js";

const resetPasswordService = new ResetPasswordService();

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    await resetPasswordService.resetPassword(req.body);
    apiSuccess(res, null, t("forgot-password.reset-code.success", locale));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return apiError(
        res,
        t("auth.invalidToken", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return apiError(
        res,
        t("auth.tokenExpired", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Handle user not found error
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return apiError(
        res,
        t("auth.userNotFound", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
    }

    if (error instanceof Error) {
      next(error); // Propagate to global error handler
    }
  }
};
