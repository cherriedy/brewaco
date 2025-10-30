import { GetCategoriesService } from "#common/services/category/get-categories.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { pagingConfig } from "#config/app.js";
import { Category as ICategory } from "#interfaces/category.interface.js";
import { NextFunction, Request, Response } from "express";

const getCategoriesService = new GetCategoriesService();

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const pageSize =
      parseInt(req.query.pageSize as string) || pagingConfig.pageSize;
    const sortBy = (req.query.sortBy as string) || "updatedAt";
    const sortOrder = parseInt(req.query.sortOrder as string) === 1 ? 1 : -1;

    const categories = await getCategoriesService.getCategories(
      page,
      pageSize,
      sortOrder,
      sortBy as keyof ICategory,
    );
    apiSuccess(res, categories, t("category.list.success", req.locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error); // Propagate other errors to the global error handler
    }
  }
};
