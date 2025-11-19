import { updateCategorySchema } from "#common/models/validation/category.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { UpdateCategoryService } from "../../services/category/update-category.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const updateCategoryService = new UpdateCategoryService();

/**
 * Updates an existing category
 *
 * Workflow:
 * - Validates request body using the category update schema (`updateCategorySchema`).
 * - Invokes the update service with category ID (`req.params.id`) and validated data.
 * - On success, responds with the updated category and a localized success message.
 * - Handles:
 *   - Validation errors (Zod): returns 400 with details.
 *   - Not found errors: returns 404 if category does not exist.
 *   - Other errors: passes to next middleware for centralized error handling.
 *
 * Access: Admin only.
 *
 * @param req Express request object
 *   - params.id: Category ID to update
 *   - body: Update data for the category
 * @param res Express response object
 * @param next Express next function for error handling
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const validated = updateCategorySchema.parse(req.body);
    const category = await updateCategoryService.updateCategory(
      req.params.id,
      validated,
    );
    apiSuccess(res, category, t("category.update.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }

    // Handle not found error
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      apiError(
        res,
        t("category.notFound", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
      return;
    }

    if (error instanceof Error && error.message === "CATEGORY_ALREADY_EXISTS") {
      apiError(
        res,
        t("category.alreadyExists", locale),
        null,
        StatusCodes.CONFLICT,
      );
      return;
    }

    if (error instanceof Error) {
      next(error);
    }
  }
};
