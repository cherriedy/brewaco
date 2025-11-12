import { Types } from "mongoose";

export interface Promotion {
  _id: Types.ObjectId;
  active: boolean;
  code: string;
  createdAt?: Date;
  description: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  endDate: Date;
  minOrderValue: number;
  startDate: Date;
  updatedAt?: Date;
}
