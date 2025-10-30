import { Review as IReview } from "#interfaces/review.interface.js";
import { model, Schema } from "mongoose";

export const reviewSchema = new Schema<IReview>(
  {
    comment: { type: String },
    productId: {
      ref: "Product",
      required: true,
      type: Schema.Types.ObjectId,
    },
    rating: { max: 5, min: 1, type: Number },
    userId: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
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
