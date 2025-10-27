import { Request, Response, NextFunction } from "express";
import { Role } from "#interfaces/role.interface.js";
import { apiError } from "#utils/api-response.js";
import { t } from "#utils/i18n.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { MissingEnvVarError } from "#errors/missing-env-var.error.js";
import logger from "#utils/logger.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      role: Role;
    };
    isPublic?: boolean;
  }
}

export function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Skip authentication for public routes
  if (req.isPublic === true) return next();

  const locale = req.locale;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiError(
      res,
      t("unauthorized", locale),
      null,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || typeof jwtSecret !== "string") {
    // Pass the error to the next error-handling middleware
    return next(new MissingEnvVarError("JWT_SECRET"));
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
      return apiError(
        res,
        t("auth.tokenExpired", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return apiError(
        res,
        t("auth.invalidToken", locale),
        null,
        StatusCodes.UNAUTHORIZED,
      );
    }

    return apiError(
      res,
      t("unauthorized", locale),
      null,
      StatusCodes.UNAUTHORIZED,
    );
  }
}
