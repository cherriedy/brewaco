import { Request, Response, NextFunction } from "express";
import { GetUserProfileService } from "#common/services/user/get-user-profile.service.js";
import { apiSuccess, apiError } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";

const getUserProfileService = new GetUserProfileService();

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locale = req.locale;

  try {
    const userId = req.user!.id; // có từ authMiddleware
    const user = await getUserProfileService.getProfile(userId);

    return apiSuccess(res, user, t("user.profile.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INVALID_USER_ID") {
      return apiError(res, t("invalidUserId", locale), null);
    }

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return apiError(res, t("user.notFound", locale), null);
    }

    next(error);
  }
};
