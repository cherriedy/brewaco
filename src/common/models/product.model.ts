/* eslint-disable perfectionist/sort-objects */
import {
  onProductDelete,
  onProductUpsert,
} from "#common/services/search/product-meili.service.js";
import { getSlug } from "#common/utils/text-utilities.js";
import { Product as IProduct } from "#interfaces/product.interface.js";
import { model, Schema } from "mongoose";

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
  { timestamps: true, versionKey: false }, // automatically adds createdAt & updatedAt
);

productSchema.index({ categoryId: 1 });

// Create compound index for common queries
productSchema.index({ categoryId: 1, price: 1 });
productSchema.index({ ratingsAverage: -1 });

productSchema.pre("validate", function (next) {
  if (!this.slug || this.slug.trim() === "") {
    if (this.name && this.name.trim() !== "") {
      this.slug = getSlug(this.name);
    }
  }
  next();
});

// After saving a product, update the MeiliSearch index asynchronously
productSchema.post("save", async function (doc, next) {
  onProductUpsert(doc).then(() => {
    next();
  });
});

// After deleting a product, remove it from the MeiliSearch index asynchronously
productSchema.post("findOneAndDelete", async function (doc, next) {
  onProductDelete(doc._id.toString()).then(() => {
    next();
  });
});

export const Product = model<IProduct>("Product", productSchema);
