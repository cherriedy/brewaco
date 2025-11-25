import mongoose from "mongoose";
import { Payment } from "../../models/payment.model.js";

export class GetPaymentService {
  /**
   * Retrieves a single payment by ID
   * @throws INVALID_PAYMENT_ID
   * @throws PAYMENT_NOT_FOUND
   */
  async getPayment(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_PAYMENT_ID");
    }

    const payment = await Payment.findById(id);

    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    return payment;
  }
}
