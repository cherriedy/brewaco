import { apiError, apiSuccess } from "../../utils/api-response.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { LoginService } from "../../services/auth/login.service.js";
import { t } from "#common/utils/i18n.js";
import { StatusCodes } from "http-status-codes";
import { handleZodError } from "#common/utils/zod-error-handler.js";

const loginService = new LoginService();

/**
 * Factory function to create an Express middleware for handling login requests.
 *
 * @param allowedRoles Optional array of role names. If specified, only users with these roles can log in.
 *
 * @returns An async Express middleware function `(req, res, next)` that:
 *   1. Resolves the allowed roles for login, using either the explicit `allowedRoles` argument
 *      or `req.allowedRoles` (set by upstream middleware).
 *   2. Invokes `LoginService.login` with the request body and resolved roles.
 *   3. On successful login, sends a localized success response using `apiSuccess`.
 *   4. Handles errors:
 *      - Zod validation errors: Translates and returns a localized validation error response.
 *      - Role not allowed: Returns a localized forbidden error response.
 *      - Invalid credentials: Returns a localized bad request error response.
 *      - Any other error: Delegates to Express error handler via `next`.
 */
const loginHandler =
  (allowedRoles?: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const locale = req.locale;
    try {
      const roles = allowedRoles ?? (req as any).allowedRoles;
      const result = await loginService.login(
        req.body,
        roles ? Array.from(roles) : undefined,
      );
      apiSuccess(res, result, t("login.success", locale));
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const validationErrors = handleZodError(error, locale);
        return apiError(res, t("validation", locale), validationErrors);
      }
      if (error instanceof Error && error.message === "ROLE_NOT_ALLOWED") {
        return apiError(
          res,
          t("login.invalidCredentials", locale),
          null,
          StatusCodes.BAD_REQUEST,
        );
      }
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        return apiError(
          res,
          t("login.invalidCredentials", locale),
          null,
          StatusCodes.BAD_REQUEST,
        );
      }
      if (error instanceof Error) {
        next(error);
      }
    }
  };

export const adminLogin = loginHandler(["admin"]);
export const customerLogin = loginHandler(["customer"]);
