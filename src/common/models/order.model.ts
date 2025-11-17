import {
  Order as IOrder,
  OrderItem,
  ShippingAddress,
} from "#interfaces/order.interface.js";
import { model, Schema } from "mongoose";

const orderItemSchema = new Schema<OrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    images: [{ type: String }],
    isReviewed: { type: Boolean, default: false },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<ShippingAddress>(
  {
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    detail: { type: String, required: true },
    phone: { type: String, required: true },
    recipientName: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["COD", "VNPAY", "MOMO"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILD"],
      default: "PENDING"
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRM", "SHIPPING", "DELIVERED", "CANCELLED"],
      default: "PENDING"
    },

    // Các mốc thời gian theo trạng thái
    paidTimestamp: { type: Date },
    failedTimestamp: { type: Date },
    confirmedTimestamp: { type: Date },
    shippingTimestamp: { type: Date },
    deliveredTimestamp: { type: Date },
    cancelledTimestamp: { type: Date },

    shippingAddress: { type: shippingAddressSchema, required: true },
    promotionCode: { type: String },
    discountAmount: { type: Number, default: 0, min: 0 },
    note: { type: String },

    isReviewed: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true, versionKey: false },
);

// Indexes for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema);
