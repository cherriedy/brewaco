import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ForgotPasswordService } from "../../services/auth/forgot-password.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { HandlebarsEngine } from "../../utils/handlebars-engine.js";
import { t } from "../../utils/i18n.js";
import logger from "../../utils/logger.js";
import { MailerSendSender } from "../../utils/mailersend-sender.js";

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
      date: req.date,
      device: req.device,
      location: req.location,
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
      apiError(res, t("auth.userNotFound", locale), null, 404);
      return;
    }

    if (error instanceof Error) {
      next(error); // Propagate other errors to the global error handler
    }
  }
};
