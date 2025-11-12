import { Order } from "#common/models/order.model.js";
import { Payment } from "#common/models/payment.model.js";
import { paymentConfig } from "#config/app.js";

export class CancelExpiredPaymentsService {
  async execute(): Promise<number> {
    const PAYMENT_RETRY_PERIOD = paymentConfig.retry.period * 60 * 60 * 1000; // 1 hour
    const expiryDate = new Date(Date.now() - PAYMENT_RETRY_PERIOD);

    // Find all pending payments older than retry period
    const expiredPayments = await Payment.find({
      createdAt: { $lt: expiryDate },
      status: "PENDING",
    });

    let canceledCount = 0;

    for (const payment of expiredPayments) {
      // Cancel the order
      const order = await Order.findByIdAndUpdate(
        payment.orderId,
        { status: "CANCELED" },
        { new: true },
      );

      if (order) {
        // Mark payment as failed
        payment.status = "FAILED";
        await payment.save();
        canceledCount++;
      }
    }

    return canceledCount;
  }
}
