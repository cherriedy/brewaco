import { model, Schema } from "mongoose";
import { Category as ICategory } from "#interfaces/category.interface.js";
import { getSlug } from "#common/utils/text-utilities.js";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }, // automatically adds createdAt & updatedAt
);

categorySchema.pre("validate", function (next) {
  if (!this.slug || this.slug.trim() === "") {
    this.slug = getSlug(this.name);
    next();
  }
});

export const Category = model<ICategory>("Category", categorySchema);
