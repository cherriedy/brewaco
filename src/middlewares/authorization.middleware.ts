import { NextFunction, Request, Response } from "express";
import { hasPermission, Method } from "#config/rbac.js";
import { apiError } from "#utils/api-response.js";
import { t } from "#utils/i18n.js";
import { logger } from "#utils/logger.js";

export function authorizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Skip authorization for public routes
  if (req.isPublic === true) return next();

  const path = req.path;
  const method = req.method as Method;
  const role = req.user?.role ?? "customer";
  const userId = req.user?.id ?? "anonymous";
  const permission = hasPermission(role, path, method);

  if (!permission) {
    logger.warn(
      `Authorization failed: user=${userId}, role=${role}, path=${path}, method=${method}`,
    );

    // Return 403 for authenticated users (they know the route exists)
    // Return 404 for unauthenticated users (hide endpoint existence)
    const statusCode = req.user ? 403 : 404;
    const message = req.user
      ? t("forbidden", req.locale)
      : t("notFound", req.locale);

    return apiError(res, message, null, statusCode);
  }

  next();
}
