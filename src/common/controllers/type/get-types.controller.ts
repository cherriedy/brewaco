import { GetTypesService } from "#common/services/type/get-types.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { pagingConfig } from "#config/app.js";
import { Type as IType } from "#interfaces/type.interface.js";
import { NextFunction, Request, Response } from "express";

const getTypesService = new GetTypesService();

export const getTypes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const pageSize =
      parseInt(req.query.pageSize as string) || pagingConfig.pageSize;
    const sortBy = (req.query.sortBy as string) || "updatedAt";
    const sortOrder =
      parseInt(req.query.sortOrder as string) === 1 ? 1 : -1;

    const types = await getTypesService.getTypes(
      page,
      pageSize,
      sortOrder,
      sortBy as keyof IType
    );

    apiSuccess(res, types, t("type.list.success", req.locale));
  } catch (error) {
    next(error);
  }
};
