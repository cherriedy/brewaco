import { Types } from "mongoose";

export interface Review {
  comment?: string;
  createdAt: Date;
  updatedAt?: Date;
  productId: Types.ObjectId;
  rating: number;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
}
