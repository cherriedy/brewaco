import { NextFunction, Request, Response } from "express";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { ZodError } from "zod";
import { t } from "../../utils/i18n.js";
import logger from "../../utils/logger.js";
import { HandlebarsEngine } from "../../utils/handlebars-engine.js";
import { MailerSendSender } from "../../utils/mailersend-sender.js";
import { ForgotPasswordService } from "../../services/auth/forgot-password.service.js";

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  const engine = new HandlebarsEngine();
  const mailer = new MailerSendSender();
  const forgotPasswordService = new ForgotPasswordService(engine, mailer);

  try {
    const emailData = {
      device: req.device,
      location: req.location,
      date: req.date,
    };

    await forgotPasswordService.forgotPassword(
      req.body,
      emailData,
      t("forgot-password.subject", locale),
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

    // Handle user not found error
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return apiError(res, t("auth.userNotFound", locale), null, 404);
    }

    if (error instanceof Error) {
      next(error); // Propagate other errors to the global error handler
    }
  }
};
