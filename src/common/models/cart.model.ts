import { Cart as ICart } from "#interfaces/cart.interface.js";
import { model, Schema } from "mongoose";

export const cartSchema = new Schema<ICart>(
  {
    items: {
      default: [],
      type: [
        {
          productId: {
            ref: "Product",
            required: true,
            type: Schema.Types.ObjectId,
          },
          quantity: { min: 0, required: true, type: Number },
        },
      ],
    },
    userId: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
      unique: true,
    },
  },
  { timestamps: true, versionKey: false },
);

// Note: userId already has unique index from schema definition
cartSchema.index({ "items.productId": 1 });

export const Cart = model<ICart>("Cart", cartSchema);
