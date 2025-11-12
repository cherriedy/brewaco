import { PaymentMethod, PaymentStatus } from "#types/payment.js";
import { Types } from "mongoose";

export interface Payment {
  amount: number;
  createdAt: Date;
  orderId: Types.ObjectId;
  provider: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  updatedAt: Date;
  userId: Types.ObjectId;
}
