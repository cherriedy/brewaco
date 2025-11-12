import { Payment } from "#common/models/payment.model.js";

export class GetPaymentByOrderIdService {
  /**
   * Retrieves a payment record associated with the specified order ID.
   *
   * This method queries the database for a payment linked to the given order,
   * and throws an error if no matching payment is found.
   *
   * @param orderId - The unique identifier of the order to search for.
   * @returns The corresponding Payment record if found.
   * @throws Error if no payment is found for the provided order ID.
   */
  async invoke(orderId: string) {
    const payment = await Payment.findOne({ orderId }).populate("orderId");
    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }
    return payment;
  }
}
