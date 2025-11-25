import { Payment } from "../../models/payment.model.js";

export class DeletePaymentService {
  async deletePayment(id: string) {
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    return payment;
  }
}
