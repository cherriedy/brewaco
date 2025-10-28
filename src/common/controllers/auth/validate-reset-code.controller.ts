import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { apiSuccess, apiError } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import logger from "../../utils/logger.js";
import jwt from "jsonwebtoken";
import { ValidateResetCodeService } from "../../services/auth/validate-reset-code.service.js";
import { handleZodError } from "../../utils/zod-error-handler.js";
import { StatusCodes } from "http-status-codes";

const validateResetCodeService = new ValidateResetCodeService();

export const validateResetCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const result = await validateResetCodeService.validateResetCode(req.body);
    apiSuccess(res, result, t("forgot-password.reset-code.validCode", locale));
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(
        res,
        t("auth.validationError", locale),
        validationErrors,
        StatusCodes.UNPROCESSABLE_ENTITY,
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

    // Handle invalid code error
    if (error instanceof Error && error.message === "INVALID_CODE") {
      return apiError(
        res,
        t("forgot-password.reset-code.invalidCode", locale),
        null,
      );
    }

    // Handle expired code error
    if (error instanceof Error && error.message === "EXPIRED_CODE") {
      return apiError(
        res,
        t("forgot-password.reset-code.expiredCode", locale),
        null,
      );
    }

    if (error instanceof Error) {
      next(error); // Propagate to the global error handler
    }
  }
};
