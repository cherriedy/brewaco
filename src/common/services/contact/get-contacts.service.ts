import { Contact } from "#common/models/contact.model.js";
import { Product } from "#common/models/product.model.js";
import { Contact as IContact } from "#interfaces/contact.interface.js";
import { Page } from "#interfaces/page.interface.js";

export class GetContactsService {
  /**
   * Fetches a paginated list of products from the database.
   *
   * Returns only essential product information for UI display.
   * Products are sorted by the specified field and order.
   * Supports pagination via `page` and `pageSize` parameters.
   *
   * @param page - Zero-based index of the page to retrieve.
   * @param pageSize - Number of products per page.
   * @param sortOrder - Sort order: 1 for ascending, -1 for descending. Defaults to -1.
   * @param sortBy - Field to sort the products by. Defaults to "createdAt".
   * @returns Promise resolving to a paginated result containing products and metadata.
   */
  async getContacts(
    page: number,
    pageSize: number,
    sortOrder: -1 | 1,
    sortBy = "createdAt",
  ): Promise<Page<IContact>> {
    const contacts = await Contact.find()
      .sort({ [sortBy]: sortOrder })
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();

    const total = await Product.countDocuments();
    const totalPage = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items: contacts,
      page,
      pageSize,
      total,
      totalPage,
    };
  }
}
