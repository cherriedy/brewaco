import { PaymentStatus } from "#types/payment.js";

export interface PaymentResult {
  amount: number;
  rawResponse?: any;
  status: PaymentStatus;
  transactionId: string;
}
