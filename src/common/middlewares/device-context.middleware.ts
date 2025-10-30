import { NextFunction, Request, Response } from "express";
import geoip from "geoip-lite";

import { t } from "../utils/i18n.js";

declare module "express-serve-static-core" {
  interface Request {
    date: string;
    device: string;
    locale: string;
    location: string;
  }
}

/**
 * Express middleware to detect and set device context including locale, device, location, and date.
 *
 * This middleware populates the following properties on the request object:
 * - req.locale: User's preferred language ('vi' for Vietnamese, 'en' for English)
 * - req.device: User agent string or localized "Unknown device" message
 * - req.location: Geographic location based on IP (e.g., "Ho Chi Minh City, VN") or localized "Unknown location"
 * - req.date: Current date/time formatted according to the user's locale
 *
 * The locale is determined from the Accept-Language header and defaults to English.
 * This enables downstream handlers and controllers to use these values for personalization.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * // If Accept-Language: vi, then req.locale === 'vi'
 * // If Accept-Language: en-US,en;q=0.9, then req.locale === 'en'
 * // If Accept-Language: fr, then req.locale === 'en' (default)
 */
export function deviceContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Read and normalize the Accept-Language header from the request
  const lang =
    typeof req.headers["accept-language"] === "string"
      ? req.headers["accept-language"]
      : "";

  // Determine user's preferred locale based on Accept-Language header
  // Supports Vietnamese (vi) and English (en), defaults to English
  if (lang.startsWith("vi")) {
    req.locale = "vi";
  } else if (lang.startsWith("en")) {
    req.locale = "en";
  } else {
    req.locale = "en"; // Default to English for unsupported languages
  }

  // Extract device information from User-Agent header
  req.device =
    req.headers["user-agent"] ?? t("deviceContext.unknownDevice", req.locale);

  // Determine geographic location using GeoIP lookup based on request IP
  // If lookup fails, fall back to displaying the IP address itself
  if (req.ip) {
    const geo = geoip.lookup(req.ip);
    req.location =
      geo && geo.city && geo.country ? `${geo.city}, ${geo.country}` : req.ip;
  } else {
    req.location = t("deviceContext.unknownLocation", req.locale);
  }

  // Format current date/time according to user's locale preference
  // Uses UTC timezone for consistency across different server locations
  req.date = new Date().toLocaleString(req.locale, { timeZone: "UTC" });

  // Continue to next middleware or route handler
  next();
}
