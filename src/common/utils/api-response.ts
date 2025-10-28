import { Response } from "express";

/**
 * Sends a successful API response.
 * @param res - The Express response object.
 * @param data - The data to include in the response.
 * @param message - An optional success message.
 */
export const apiSuccess = (res: Response, data: unknown, message?: string) => {
  void res.json({
    data,
    errors: null,
    message: message ?? null,
    success: true,
  });
};

/**
 * Sends an error API response.
 * @param res - The Express response object.
 * @param message - The error message.
 * @param errors - Optional error details.
 * @param status - The HTTP status code (default 400).
 */
export const apiError = (
  res: Response,
  message: string,
  errors?: unknown,
  status = 400,
) => {
  res
    .status(status)
    .json({ data: null, errors: errors ?? null, message, success: false });
};
