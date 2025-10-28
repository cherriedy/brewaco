/* eslint-disable perfectionist/sort-interfaces,perfectionist/sort-objects */
import { Product as IProduct } from "#interfaces/product.interface.js";
import { model, Schema } from "mongoose";
import { getSlug } from "#common/utils/text-utilities.js";

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    origin: { type: String, required: true },
    type: { type: String, required: true },
    weight: { type: String, required: true },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }, // automatically adds createdAt & updatedAt
);

productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });

// Create compound index for common queries
productSchema.index({ categoryId: 1, price: 1 });
productSchema.index({ ratingsAverage: -1 });

productSchema.pre("validate", function (next) {
  if (!this.slug || this.slug.trim() === "") {
    this.slug = getSlug(this.name);
    next();
  }
});

export const Product = model<IProduct>("Product", productSchema);
