/* eslint-disable perfectionist/sort-interfaces,perfectionist/sort-objects */
import { model, Schema } from "mongoose";
import { hashPassword } from "#utils/hash-password.js";

interface Address {
  city?: string;
  country?: string;
  state?: string;
  street?: string;
  zip?: string;
}

interface User {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role: "admin" | "customer";
  address?: Address;
  createdAt?: Date;
  updatedAt?: Date;
  resetToken?: string;
  resetTokenExp?: Date;
  resetCode?: string;
  resetCodeExp?: Date;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    resetToken: String,
    resetTokenExp: Date,
    resetCode: String,
    resetCodeExp: Date,
  },
  { timestamps: true }, // automatically adds createdAt & updatedAt
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

export const User = model<User>("User", userSchema);
