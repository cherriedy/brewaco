import { Contact as IContact } from "#interfaces/contact.interface.js";
import { model, Schema } from "mongoose";

const contactSchema = new Schema<IContact>(
  {
    email: { required: true, type: String },
    message: { required: true, type: String },
    name: { required: true, type: String },
    state: { default: "new", enum: ["new", "replied"], type: String },
  },
  { timestamps: true, versionKey: false },
);

contactSchema.pre("save", function (next) {
  this.message = this.message.trim();
  next();
});

contactSchema.index({ email: 1, state: 1 });

export const Contact = model<IContact>("Contact", contactSchema);
