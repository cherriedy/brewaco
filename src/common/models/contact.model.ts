import { Contact as IContact } from "#interfaces/contact.interface.js";
import { model, Schema } from "mongoose";

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    state: { type: String, enum: ["new", "replied"], default: "new" },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

contactSchema.pre("save", function (next) {
  this.message = this.message.trim();
  next();
});

contactSchema.index({ email: 1, state: 1 });

export const Contact = model<IContact>("Contact", contactSchema);
