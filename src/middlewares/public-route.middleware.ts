import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    isPublic?: boolean;
  }
}

/**
 * Middleware to mark a route as public (bypasses authorization).
 * Attach this before route handlers to allow unauthenticated access.
 * Sets `req.isPublic` to `true` for downstream middlewares and handlers.
 * Example usage: `app.get("/public", publicRoute, handler)`
 */
export function publicRoute(req: Request, res: Response, next: NextFunction) {
  req.isPublic = true;
  next();
}
