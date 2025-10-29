import { model, Schema } from "mongoose";
import { Review as IReview } from "#interfaces/review.interface.js";

export const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

reviewSchema.index({ rating: -1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

reviewSchema.pre("save", function (next) {
  this.comment = this.comment.trim();
  next();
});

export const Review = model<IReview>("Review", reviewSchema);
