import { createTypeSchema } from "#common/models/validation/type.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { NextFunction, Request, Response } from "express";

import { CreateTypeService } from "../../services/type/create-type.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const createTypeService = new CreateTypeService();

export const createType= async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;

  try {
    const validated = createTypeSchema.parse(req.body);
    const type = await createTypeService.createType(validated);

    apiSuccess(res, type, t("type.create.success", locale));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }

    if (error instanceof Error && error.message === "TYPE_ALREADY_EXISTS") {
      apiError(
        res,
        t("type.alreadyExists", locale),
        null,
        StatusCodes.CONFLICT,
      );
      return;
    }

    next(error);
  }
};
