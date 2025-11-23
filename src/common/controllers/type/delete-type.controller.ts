import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { DeleteTypeService } from "../../services/type/delete-type.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const deleteTypeService = new DeleteTypeService();

export const deleteType = async (req: Request, res: Response, next: NextFunction) => {
  const locale = req.locale;

  try {
    await deleteTypeService.deleteType(req.params.id);
    apiSuccess(res, null, t("type.delete.success", locale));
  } catch (error) {
    if (error instanceof Error && error.message === "TYPE_NOT_FOUND") {
      apiError(res, t("type.notFound", locale), null, StatusCodes.NOT_FOUND);
      return;
    }

    next(error);
  }
};
