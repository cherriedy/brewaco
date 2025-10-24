import { Request, Response } from "express";
import { User } from "#models/user.model.js";
import { apiError, apiSuccess } from "#utils/api-response.js";
import { z, ZodError } from "zod";
import { t } from "#utils/i18n.js";
import logger from "#utils/logger.js";
import crypto from "crypto";
import { HandlebarsEngine } from "#utils/handlebars-engine.js";
import { MailerSendSender } from "#utils/mailersend-sender.js";
import { authConfig } from "#config/app.js";
import { emailSchema } from "#models/validation/validations.js";

const forgotPasswordSchema = z.object({ email: emailSchema });

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const locale = req.locale;
  const engine = new HandlebarsEngine();
  const mailer = new MailerSendSender();

  try {
    const data = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user) {
      apiError(res, t("auth.userNotFound", locale), 404);
      return;
    }

    const codeLength = authConfig.pwForgot.resetCode.length;
    const codeExpire = authConfig.pwForgot.resetCode.expire;
    user.resetCode = crypto
      .randomInt(10 ** (codeLength - 1), 10 ** codeLength - 1)
      .toString();
    user.resetCodeExp = new Date(Date.now() + codeExpire * 60 * 1000);
    await user.save();

    const variables: Record<string, string> = {
      code: user.resetCode,
      codeExpiryMinutes: codeExpire.toString(),
      device: req.device,
      location: req.location,
      date: req.date,
    };

    // Render the HTML email template with variables
    const htmlContent = await engine.render("forgot-password", variables);

    // Send the forgot password email with the reset code
    await mailer.sendEmail(
      data.email,
      t("forgot-password.subject", locale),
      htmlContent,
    );

    apiSuccess(res, null, t("forgot-password.emailSent", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: t(err.message, locale),
      }));
      apiError(res, t("validation", locale), validationErrors, 422);
    }

    if (error instanceof Error) {
      logger.error(error.message);
      apiError(res, t("serverError", locale), null, 500);
    }
  }
};
