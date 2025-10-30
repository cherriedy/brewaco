import mongoose, { Types } from "mongoose";

export interface Product {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt?: Date;
  description: string;
  discount: number;
  images: string[];
  name: string;
  origin: string;
  price: number;
  ratingsAverage: number;
  ratingsCount: number;
  slug: string;
  stock: number;
  type: string;
  updatedAt?: Date;
  weight: string;
}
