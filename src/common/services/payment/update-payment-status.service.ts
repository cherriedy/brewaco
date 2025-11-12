import { Order } from "#common/models/order.model.js";
import { Payment } from "#common/models/payment.model.js";
import { PaymentStatus } from "#types/payment.js";

export class UpdatePaymentStatusService {
  /**
   * Updates the payment status for a given order after verification.
   *
   * This method ensures the payment record is updated and the corresponding
   * order status is adjusted based on the payment outcome.
   *
   * @param orderId - The unique identifier of the order
   * @param status - The new payment status (e.g., SUCCESS, FAILED)
   * @param transactionId - The transaction ID provided by the payment gateway
   */
  async invoke(
    orderId: string,
    status: PaymentStatus,
    transactionId: string,
  ): Promise<void> {
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    payment.status = status;
    payment.transactionId = transactionId;

    await payment.save();

    // Update order status
    if (status === "SUCCESS") {
      await Order.findByIdAndUpdate(orderId, { status: "PAID" });
    } else if (status === "FAILED") {
      // Optionally restore product stock
      const order = await Order.findById(orderId);
      if (order) {
        // You could restore stock here if needed
      }
    }
  }
}
