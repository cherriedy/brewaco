import { NextFunction, Request, Response } from "express";
import { DeleteCategoryService } from "../../services/category/delete-category.service.js";
import { apiSuccess, apiError } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import { StatusCodes } from "http-status-codes";

const deleteCategoryService = new DeleteCategoryService();

/**
 * Deletes a category by its ID. Accessible to admin users only.
 *
 * This controller expects the category ID to be provided in the request parameters.
 * On successful deletion, it returns a localized success message.
 * If the category does not exist, it responds with a 404 error and a localized not found message.
 * Any other errors are passed to the next middleware for handling.
 *
 * Access: Admin
 *
 * @param req - Express request object containing the category ID in `req.params.id`
 * @param res - Express response object used to send the API response
 * @param next - Express next function for error handling
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    await deleteCategoryService.deleteCategory(req.params.id);
    apiSuccess(res, null, t("category.delete.success", locale));
  } catch (error: unknown) {
    // Handle not found error
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return apiError(
        res,
        t("category.notFound", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
    }

    if (error instanceof Error) {
      next(error);
    }
  }
};
