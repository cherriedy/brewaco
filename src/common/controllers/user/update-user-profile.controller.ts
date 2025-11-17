import { Request, Response, NextFunction } from "express";
import { apiSuccess, apiError } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { updateUserSchema } from "#common/models/validation/user.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { ZodError } from "zod";
import { UpdateUserService } from "#common/services/user/update-user-profile.service.js";

const updateUserService = new UpdateUserService();

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locale = req.locale;

  try {
    const userId = req.user!.id;
    const payload = updateUserSchema.parse(req.body);

    const updatedUser = await updateUserService.updateProfile(userId, payload);
    apiSuccess(res, updatedUser, t("user.update.success", locale));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }

    if (error instanceof Error && error.message === "INVALID_USER_ID") {
      return apiError(res, t("invalidUserId", locale), null);
    }

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return apiError(res, t("user.notFound", locale), null);
    }

    next(error);
  }
};
