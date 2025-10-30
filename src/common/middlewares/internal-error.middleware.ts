import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { apiError } from "../utils/api-response.js";
import { t } from "../utils/i18n.js";
import logger from "../utils/logger.js";

/**
 * Express error-handling middleware for internal server errors.
 * Logs the error and sends a standardized error response with localization.
 *
 * @param err - The error object caught by Express.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export function internalErrorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error("Internal server error occurred:\n", err);

  // Respond with a localized internal error message and status code 500
  apiError(
    res,
    t("internalError", req.locale),
    null,
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
}
