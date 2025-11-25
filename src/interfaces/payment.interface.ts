import { PaymentMethod, PaymentStatus } from "#types/payment.js";
import { Types } from "mongoose";

export interface Payment {
  _id?: Types.ObjectId;
  orderId: Types.ObjectId | string;
  paymentMethod: PaymentMethod;
  transactionId?: string; 
  amount?: number;
  bankCode?: string;
  gatewayResponseCode?: string | number;
  payUrl?: string;
  status?: PaymentStatus;
  paidTimestamp?: Date;
  failedTimestamp?: Date;
  refundedTimestamp?: Date;
  rawResponse?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
