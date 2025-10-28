import { Schema } from "mongoose";
import { Cart as ICart } from "#interfaces/cart.interface.js";

export const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

cartSchema.index({ userId: 1 });
cartSchema.index({ "items.productId": 1 });
