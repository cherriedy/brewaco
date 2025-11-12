import { UpdatePromotionPayload } from "#common/models/validation/promotion.validation.js";
import { promotionConfig } from "#config/app.js";
import mongoose from "mongoose";

import { Promotion } from "../../models/promotion.model.js";

export class UpdatePromotionService {
  /**
   * Updates an existing promotion by its ID.
   *
   * @param id - The promotion ID to update.
   * @param data - Object containing the updated promotion details.
   * @returns Promise<Promotion> - Resolves with the updated promotion instance on success.
   * @throws Error if the ID is invalid, promotion is not found, or validation fails.
   */
  async updatePromotion(id: string, data: UpdatePromotionPayload) {
    // Validate the id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_PROMOTION_ID");
    }

    // Check if promotion exists
    const existing = await Promotion.findById(id);
    if (!existing) throw new Error("PROMOTION_NOT_FOUND");

    // If updating code, check for duplicates
    if (data.code && data.code !== existing.code) {
      const duplicate = await Promotion.findOne({ code: data.code });
      if (duplicate) throw new Error("PROMOTION_ALREADY_EXISTS");
    }

    // Validate dates if both are provided or if one is being updated
    const startDate = data.startDate || existing.startDate;
    const endDate = data.endDate || existing.endDate;
    if (new Date(endDate) <= new Date(startDate)) {
      throw new Error("END_DATE_BEFORE_START_DATE");
    }

    // Validate discount value for percentage type
    const discountType = data.discountType || existing.discountType;
    const discountValue = data.discountValue ?? existing.discountValue;
    if (
      discountType === "percent" &&
      (discountValue < promotionConfig.discount.minValue ||
        discountValue > promotionConfig.discount.maxPercent)
    ) {
      throw new Error("INVALID_PERCENTAGE_VALUE");
    }

    return Promotion.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
}
