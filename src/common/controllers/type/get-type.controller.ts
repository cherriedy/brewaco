import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import { GetTypeService } from "#common/services/type/get-type.service.js";

const getTypeService = new GetTypeService();

export const getType = async (req: Request, res: Response, next: NextFunction) => {
  const locale = req.locale;

  try {
    const type = await getTypeService.getType(req.params.id);
    apiSuccess(res, type, t("type.get.success", locale));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_TYPE_ID") {
        apiError(res, t("type.invalidId", locale), null, StatusCodes.NOT_FOUND);
        return;
      }

      if (error.message === "TYPE_NOT_FOUND") {
        apiError(res, t("type.notFound", locale), null, StatusCodes.NOT_FOUND);
        return;
      }
    }

    next(error);
  }
};
