import { Role } from "#types/role.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { MissingEnvVarError } from "../../errors/missing-env-var.error.js";
import { apiError } from "../utils/api-response.js";
import { t } from "../utils/i18n.js";
import logger from "../utils/logger.js";

declare module "express-serve-static-core" {
  interface Request {
    isPublic?: boolean;
    user?: {
      id: string;
      role: Role;
    };
  }
}

export function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Skip authentication for public routes
  if (req.isPublic === true) {
    next();
    return;
  }

  const locale = req.locale;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    apiError(res, t("unauthorized", locale), null, StatusCodes.UNAUTHORIZED);
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || typeof jwtSecret !== "string") {
    // Pass the error to the next error-handling middleware
    next(new MissingEnvVarError("JWT_SECRET"));
    return;
  }

  // Remove "Bearer " prefix to get the token itself
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      role: string;
    };

    // Assign user info to request object
    req.user = { id: decoded.id, role: decoded.role as Role };

    next(); // Proceed to next middleware or route handler
  } catch (error: unknown) {
    logger.error("Authentication error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      apiError(
        res,
        t("auth.tokenExpired", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      apiError(
        res,
        t("auth.invalidToken", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
      return;
    }

    apiError(res, t("unauthorized", locale), null, StatusCodes.UNAUTHORIZED);
    return;
  }
}
