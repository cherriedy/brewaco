import { Payment as IPayment } from "#interfaces/payment.interface.js";
import { Page } from "#interfaces/page.interface.js";
import { Payment } from "#common/models/payment.model.js";


export class GetPaymentsService {
  /**
   * Fetches a paginated list of payments from database.
   *
   * @param page - Zero-based index of page
   * @param pageSize - Number of items per page
   * @param sortOrder - 1 asc, -1 desc
   * @param sortBy - Field to sort
   */
  async getPayments(
    page = 0,
    pageSize: number,
    sortOrder: -1 | 1 = -1,
    sortBy: keyof IPayment = "updatedAt"
  ): Promise<Page<IPayment>> {
    const payments = await Payment.find()
      .sort({ [sortBy]: sortOrder })
      .skip(page * pageSize)
      .limit(pageSize)

    const total = await Payment.countDocuments();
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items: payments,
      page,
      pageSize,
      total,
      totalPages,
    };
  }
}
