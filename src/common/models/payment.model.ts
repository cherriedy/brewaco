import { Schema, model } from "mongoose";
import { Payment as IPayment } from "#interfaces/payment.interface.js";

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },

    paymentMethod: {
      type: String,
      enum: ["VNPAY", "MOMO", "COD"],
      required: true,
    },

    transactionId: { type: String },
    amount: { type: Number },
    bankCode: { type: String },
    gatewayResponseCode: { type: Schema.Types.Mixed },
    payUrl: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    paidTimestamp: Date,
    failedTimestamp: Date,
    refundedTimestamp: Date,

    rawResponse: { type: Object },
  },
  { timestamps: true, versionKey: false }
);

export const Payment = model("Payment", paymentSchema);
