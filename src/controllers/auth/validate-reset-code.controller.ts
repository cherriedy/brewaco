import { Request, Response } from "express";
import { z } from "zod";
import { authConfig } from "#config/app.js";
import { User } from "#models/user.model.js";
import { apiSuccess, apiError } from "#utils/api-response.js";
import { t } from "#utils/i18n.js";
import logger from "#utils/logger.js";
import jwt from "jsonwebtoken";
import { MissingEnvVarError } from "#errors/missing-env-var.error.js";

const codeLength = authConfig.pwForgot.resetCode.length;

const validateResetCodeSchema = z.object({
  email: z.email({ message: "auth.invalidEmail" }),
  code: z
    .string({ message: "forgot-password.reset-code.mustBeNumber" })
    .length(codeLength, {
      message: "forgot-password.reset-code.passwordLength",
    }),
});

export const validateResetCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const locale = req.locale;
  try {
    const data = validateResetCodeSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });

    // Check if user exists with the provided email
    if (!user) return apiError(res, t("auth.userNotFound"), null);

    // The reset code is invalid
    if (!user.resetCode || user.resetCode !== data.code) {
      return apiError(res, t("forgot-password.reset-code.invalidCode"), null);
    }

    // The reset code has expired
    if (user.resetCodeExp && user.resetCodeExp < new Date()) {
      return apiError(res, t("forgot-password.reset-code.expiredCode"), null);
    }

    // Ensure JWT_SECRET is defined and is a string
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== "string") {
      throw new MissingEnvVarError("JWT_SECRET");
    }

    // The expiry time for temporary reset token
    const expiresIn = authConfig.pwForgot.resetToken.expireIn;
    // Send the temporary token for password reset
    const resetToken = jwt.sign({ email: data.email }, jwtSecret, {
      expiresIn: `${expiresIn}m`,
    });

    apiSuccess(
      res,
      { resetToken: resetToken },
      t("forgot-password.reset-code.validCode", locale),
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: t(err.message, locale),
      }));
      return apiError(
        res,
        t("auth.validationError", locale),
        validationErrors,
        422,
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return apiError(res, t("auth.tokenExpired", locale), null, 401);
    }

    if (error instanceof Error) {
      logger.error(`Validate reset code error: ${error.message}`);
      return apiError(res, t("serverError", locale), null, 500);
    }
  }
};
