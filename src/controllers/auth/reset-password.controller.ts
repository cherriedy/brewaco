import { Request, Response } from "express";
import { passwordSchema } from "#models/validation/validations.js";
import { z, ZodError } from "zod";
import jwt from "jsonwebtoken";
import { User } from "#models/user.model.js";
import { apiError, apiSuccess } from "#utils/api-response.js";
import { t } from "#utils/i18n.js";
import { hashPassword } from "#utils/hash-password.js";
import { MissingEnvVarError } from "#errors/missing-env-var.error.js";
import logger from "#utils/logger.js";

const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  token: z.string(),
});

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const locale = req.locale;
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== "string") {
      throw new MissingEnvVarError("JWT_SECRET");
    }

    const data = resetPasswordSchema.parse(req.body);
    const decoded = jwt.verify(data.token, jwtSecret) as { email: string };
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return apiError(res, t("auth.userNotFound"), null);
    }

    user.password = await hashPassword(data.newPassword);
    user.resetCode = undefined;
    user.resetCodeExp = undefined;
    await user.save();

    apiSuccess(res, null, t("forgot-password.reset-code.success", locale));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: t(err.message, locale),
      }));
      return apiError(res, t("validation", locale), validationErrors);
    }

    if (error instanceof Error) {
      logger.error(error.message);
      return apiError(res, t("serverError", locale), null);
    }
  }
};
