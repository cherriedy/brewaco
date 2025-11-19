import { getSlug } from "#common/utils/text-utilities.js";
import { Category as ICategory } from "#interfaces/category.interface.js";
import { model, Schema } from "mongoose";

const categorySchema = new Schema<ICategory>(
  {
    description: { required: false, type: String },
    name: { required: true, type: String },
    slug: { required: true, type: String, unique: true },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.pre("validate", function (next) {
  if (!this.slug || this.slug.trim() === "") {
    if (this.name && this.name.trim() !== "") {
      this.slug = getSlug(this.name);
    }
  }
  next();
});

export const Category = model<ICategory>("Category", categorySchema);
