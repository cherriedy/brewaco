import { Request } from "express";

/**
 * Extracts the client IP address from the request, considering proxies.
 *
 * @param req Express request object
 * @returns The client IP address as a string
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    return xForwardedFor.split(",")[0].trim();
  } else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0].trim();
  }
  return req.ip || "";
}
