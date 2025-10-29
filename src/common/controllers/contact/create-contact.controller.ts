import { createContactSchema } from "#common/models/validation/contact.validation.js";
import { CreateContactService } from "#common/services/contact/create-contact.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

const createContactService = new CreateContactService();

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body, locale } = req;
  try {
    const validated = createContactSchema.parse(body);
    const result = await createContactService.createContact(validated);
    apiSuccess(res, result, t("contact.create.success", locale));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors, StatusCodes.BAD_REQUEST);
    }
    next(error);
  }
};
