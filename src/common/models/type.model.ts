import { getSlug } from "#common/utils/text-utilities.js";
import { Type as IType } from "#interfaces/type.interface.js";
import { model, Schema } from "mongoose";

const typeSchema = new Schema<IType>(
  {
    description: { type: String, required: false },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true, versionKey: false },
);

typeSchema.pre("validate", function (next) {
  if (!this.slug || this.slug.trim() === "") {
    if (this.name && this.name.trim() !== "") {
      this.slug = getSlug(this.name);
    }
  }
  next();
});

export const Type = model<IType>("Type", typeSchema);
