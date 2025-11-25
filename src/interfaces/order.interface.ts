import { status } from "#types/order.js";
import { Types } from "mongoose";

export interface Order {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status?: status;
  confirmedTimestamp?: Date;
  shippingTimestamp?: Date;
  deliveredTimestamp?: Date;
  cancelledTimestamp?: Date;

  shippingAddress: ShippingAddress;
  promotionCode?: string;
  discountAmount?: number;
  note?: string;
  isReviewed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  name: string;
  price: number;
  productId: Types.ObjectId;
  quantity: number;
  images?: string[];
  isReviewed?: boolean;
}

export interface ShippingAddress {
  province?: string;
  district?: string;
  ward?: string;
  detail?: string;
  phone?: string;
  recipientName?: string;
}
