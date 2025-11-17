import { Request, Response, NextFunction } from "express";
import { ChangePasswordService } from "#common/services/user/change-password.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";

const changePasswordService = new ChangePasswordService();

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const locale = req.locale;
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      return apiError(res, t("password.confirmMismatch", locale));
    }

    await changePasswordService.changePassword(userId, currentPassword, newPassword);
    apiSuccess(res, null, t("password.change.success", locale));

  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_USER_ID":
          return apiError(res, t("invalidUserId", locale));
        case "USER_NOT_FOUND":
          return apiError(res, t("user.notFound", locale));
        case "CURRENT_PASSWORD_INCORRECT":
          return apiError(res, t("password.currentIncorrect", locale));
      }
    }
    next(error);
  }
};
