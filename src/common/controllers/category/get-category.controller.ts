import { NextFunction, Request, Response } from "express";
import { GetCategoryService } from "../../services/category/get-category.service.js";
import { apiSuccess, apiError } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import { StatusCodes } from "http-status-codes";

const getCategoryService = new GetCategoryService();

/**
 * Retrieves a single category by its unique identifier.
 *
 * Access: Public
 *
 * @param req - Express request object; expects `id` parameter in `req.params`
 * @param res - Express response object used to send API responses
 * @param next - Express next function for error handling middleware
 */
export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;

  try {
    const category = await getCategoryService.getCategory(req.params.id);
    apiSuccess(res, category, t("category.get.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CATEGORY_ID") {
        return apiError(
          res,
          t("category.invalidId", locale),
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      if (error.message === "CATEGORY_NOT_FOUND") {
        return apiError(
          res,
          t("category.notFound", locale),
          null,
          StatusCodes.NOT_FOUND,
        );
      }
    }

    if (error instanceof Error) {
      next(error); // Propagate other errors to the global error handler
    }
  }
};
