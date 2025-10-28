import mongoose, { Types } from "mongoose";

export interface Product {
  name: string;
  slug: string;
  categoryId: Types.ObjectId;
  description: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  origin: string;
  type: string;
  weight: string;
  ratingsAverage: number;
  ratingsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
