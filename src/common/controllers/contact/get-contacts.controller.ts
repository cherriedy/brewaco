import { GetContactsService } from "#common/services/contact/get-contacts.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { pagingConfig } from "#config/app.js";
import { Contact } from "#interfaces/contact.interface.js";
import { NextFunction, Request, Response } from "express";

const getContactsService = new GetContactsService();

/**
 * Handles GET requests for retrieving a paginated, sorted, and localized list of contacts.
 *
 * Features:
 * - Pagination: Accepts `page` and `pageSize` to control result set size.
 * - Sorting: Supports `sortOrder` (1 for ascending, -1 for descending) and `sortBy` (contact field).
 * - Localization: Uses `locale` from the request for localized success messages.
 *
 * @param req Express request object. Expects params: `page`, `pageSize`, `sortOrder`, `sortBy`, and `locale`.
 * @param res Express response object for sending JSON data.
 * @param next Express next middleware function for error handling.
 * @returns Sends a JSON response containing contacts data and a localized success message.
 */
export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { locale, query } = req;
  try {
    const page = parseInt(query.page as string) || 0;
    const pageSize =
      parseInt(query.pageSize as string) || pagingConfig.pageSize;
    const sortOrder = parseInt(query.sortOrder as string) === 1 ? 1 : -1;
    const sortBy = (query.sortBy ?? "createdAt") as keyof Contact;
    const contacts = await getContactsService.getContacts(
      page,
      pageSize,
      sortOrder,
      sortBy,
    );
    apiSuccess(res, contacts, t("contact.list.success", locale));
  } catch (error: unknown) {
    next(error); // Propagate other errors to the global error handler
  }
};
