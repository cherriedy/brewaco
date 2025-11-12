/* eslint-disable perfectionist/sort-objects */
import { promotionConfig } from "#config/app.js";
import { Promotion as IPromotion } from "#interfaces/promotion.interface.js";
import { model, Schema } from "mongoose";

const promotionSchema = new Schema<IPromotion>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: {
      type: Number,
      required: true,
      min: promotionConfig.discount.minValue,
    },
    minOrderValue: {
      type: Number,
      required: true,
      min: promotionConfig.order.minValue,
      default: promotionConfig.order.defaultMinOrderValue,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

promotionSchema.index({ active: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

// Validate that endDate is after startDate
promotionSchema.pre("validate", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("END_DATE_BEFORE_START_DATE"));
  } else {
    next();
  }
});

export const Promotion = model<IPromotion>("Promotion", promotionSchema);
