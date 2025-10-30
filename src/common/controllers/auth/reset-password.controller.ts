import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import { ResetPasswordService } from "../../services/auth/reset-password.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import logger from "../../utils/logger.js";
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
      apiError(res, t("validation", locale), validationErrors);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      apiError(
        res,
        t("auth.invalidToken", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      apiError(
        res,
        t("auth.tokenExpired", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
      return;
    }

    // Handle user not found error
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      apiError(
        res,
        t("auth.userNotFound", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
      return;
    }

    if (error instanceof Error) {
      next(error); // Propagate to global error handler
    }
  }
};
