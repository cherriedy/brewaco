/* eslint-disable perfectionist/sort-objects */
import { User as IUser } from "#interfaces/user.interface.js";
import { model, Schema } from "mongoose";

import { hashPassword } from "../utils/hash-password.js";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    address: {
      province: {
        code: String, // Mã tỉnh
        name: String, // Tên tỉnh
      },
      district: {
        code: String, // Mã quận
        name: String, // Tên quận
      },
      ward: {
        code: String, // Mã phường
        name: String, // Tên phường
      },
      detail: String, // Số nhà, tên đường
    },
    resetToken: String,
    resetTokenExp: Date,
    resetCode: String,
    resetCodeExp: Date,
  },
  { timestamps: true, versionKey: false }, // automatically adds createdAt & updatedAt
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // If the password is not modified, skip hashing
  if (!this.isModified("password")) {
    next();
    return;
  }
  this.password = await hashPassword(this.password);
  next();
});

export const User = model<IUser>("User", userSchema);
