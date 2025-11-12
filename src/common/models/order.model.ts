/* eslint-disable perfectionist/sort-objects */
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
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<ShippingAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
    recipientName: { type: String },
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
      enum: ["COD", "VNPay"],
      required: true,
    },
    status: {
      type: String,
      enum: ["CREATED", "PAID", "SHIPPED", "DELIVERED", "CANCELED"],
      default: "CREATED",
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    promotionCode: { type: String },
    discountAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false },
);

// Indexes for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema);
