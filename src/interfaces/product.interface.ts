import mongoose, { Types } from "mongoose";

export interface Product {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  typeId: Types.ObjectId;
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
  updatedAt?: Date;
  weight: string;
}
