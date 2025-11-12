import { Address } from "#interfaces/address.interface.js";
import { OrderStatus } from "#types/order.js";
import { PaymentMethod } from "#types/payment.js";
import { Types } from "mongoose";

export interface Order {
  _id?: Types.ObjectId;
  createdAt?: Date;
  discountAmount?: number;
  items: OrderItem[];
  notes?: string;
  paymentMethod: PaymentMethod;
  promotionCode?: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  totalAmount: number;
  updatedAt?: Date;
  userId: Types.ObjectId;
}

export interface OrderItem {
  name: string;
  price: number;
  productId: Types.ObjectId;
  quantity: number;
}

export interface ShippingAddress extends Address {
  phone?: string;
  recipientName?: string;
}
