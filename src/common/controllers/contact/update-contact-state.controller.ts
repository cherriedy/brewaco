import { updateContactStateSchema } from "#common/models/validation/contact.validation.js";
import { UpdateContactStateService } from "#common/services/contact/update-contact-state.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const updateContactStateService = new UpdateContactStateService();

export const updateContactState = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  try {
    const validated = updateContactStateSchema.parse(req.body);
    const result = await updateContactStateService.updateContactState(
      req.params.id,
      validated,
    );
    apiSuccess(res, result, t("contact.update.success", locale));
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }
    if (error instanceof Error) {
      if (error.message === "CONTACT_NOT_FOUND") {
        apiError(res, t("contact.notFound", locale), null, 404);
        return;
      }
      if (error.message === "CONTACT_INVALID_STATE") {
        apiError(res, t("contact.validation.invalidState", locale), null, 404);
        return;
      }
      if (error.message === "CONTACT_INVALID_STATE_TRANSITION") {
        apiError(res, t("contact.invalidStateTransition", locale), null, 400);
        return;
      }
    }
    next(error);
  }
};
