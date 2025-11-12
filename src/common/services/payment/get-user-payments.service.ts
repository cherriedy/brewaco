import { Payment } from "#common/models/payment.model.js";

export class GetUserPaymentsService {
  /**
   * Retrieves all payment records associated with a specific user.
   *
   * The payments are populated with their related order details and sorted by creation date in descending order.
   *
   * @param userId - The unique identifier of the user whose payments are to be fetched.
   * @returns A promise resolving to an array of payment documents for the user.
   */
  async invoke(userId: string) {
    return Payment.find({ userId }).populate("orderId").sort({ createdAt: -1 });
  }
}
