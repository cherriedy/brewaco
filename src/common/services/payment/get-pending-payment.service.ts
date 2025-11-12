import { Order } from "#common/models/order.model.js";
import { Payment } from "#common/models/payment.model.js";
import { paymentConfig } from "#config/app.js";
import { Types } from "mongoose";

export class GetPendingPaymentService {
  /**
   * Retrieves a pending payment for a given order if it is still eligible for retry.
   * This method checks for a payment with status `PENDING` associated with the provided order ID,
   * and verifies that the payment has not expired based on the defined retry period (e.g., 24 hours).
   * If the payment is expired, the order is canceled and the payment is marked as failed.
   *
   * @param orderId - The unique identifier of the order to check for a pending payment.
   * @returns The Payment record if found and still valid for retry; otherwise, null.
   * @throws Error with message `PAYMENT_EXPIRED` if the payment has expired.
   */
  async invoke(orderId: string) {
    const payment = await Payment.findOne({
      orderId: new Types.ObjectId(orderId),
      status: "PENDING",
    }).populate("orderId");

    if (!payment) {
      return null;
    }

    // Check if payment is still within retry period
    const PAYMENT_RETRY_PERIOD = paymentConfig.retry.period * 60 * 60 * 1000; // 1 hour in milliseconds
    const expiryTime =
      new Date(payment.createdAt).getTime() + PAYMENT_RETRY_PERIOD;

    if (Date.now() > expiryTime) {
      // Payment expired, cancel the order
      await Order.findByIdAndUpdate(orderId, { status: "CANCELED" });
      payment.status = "FAILED";
      await payment.save();
      throw new Error("PAYMENT_EXPIRED");
    }

    return payment;
  }
}
