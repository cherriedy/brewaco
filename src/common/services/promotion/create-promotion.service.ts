import { Promotion } from "#common/models/promotion.model.js";
import { CreatePromotionPayload } from "#common/models/validation/promotion.validation.js";
import { promotionConfig } from "#config/app.js";

export class CreatePromotionService {
  /**
   * Creates a new promotion in the database.
   *
   * Process:
   * 1. Validates input data using the Zod schema for required fields and types.
   * 2. Checks if a promotion with the same code already exists to ensure uniqueness.
   * 3. Validates that endDate is after startDate.
   * 4. Persists the new promotion if validation and uniqueness checks pass.
   *
   * @param data - Object containing promotion details.
   * @returns Promise<Promotion> - Resolves with the newly created promotion instance on success.
   * @throws Error if validation fails or the promotion code already exists.
   */
  async createPromotion(data: CreatePromotionPayload) {
    // Check if promotion with same code already exists
    const existing = await Promotion.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error("PROMOTION_ALREADY_EXISTS");

    // Validate dates
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new Error("END_DATE_BEFORE_START_DATE");
    }

    // Validate discount value for percentage type
    if (
      data.discountType === "percent" &&
      (data.discountValue < promotionConfig.discount.minValue ||
        data.discountValue > promotionConfig.discount.maxPercent)
    ) {
      throw new Error("INVALID_PERCENTAGE_VALUE");
    }

    const promotion = new Promotion(data);
    await promotion.save();
    return promotion;
  }
}
