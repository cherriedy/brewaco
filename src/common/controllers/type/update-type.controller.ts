import { updateTypeSchema } from "#common/models/validation/type.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { UpdateTypeService } from "../../services/type/update-type.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const updateTypeService = new UpdateTypeService();

export const updateType = async (req: Request, res: Response, next: NextFunction) => {
  const locale = req.locale;

  try {
    const validated = updateTypeSchema.parse(req.body);
    const type = await updateTypeService.updateType(req.params.id, validated);

    apiSuccess(res, type, t("type.update.success", locale));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }

    if (error instanceof Error && error.message === "TYPE_NOT_FOUND") {
      apiError(res, t("type.notFound", locale), null, StatusCodes.NOT_FOUND);
      return;
    }

    if (error instanceof Error && error.message === "TYPE_ALREADY_EXISTS") {
      apiError(res, t("type.alreadyExists", locale), null, StatusCodes.CONFLICT);
      return;
    }

    next(error);
  }
};
