import { ValidatePromotionPayload } from "#common/models/validation/promotion.validation.js";
import { promotionConfig } from "#config/app.js";

import { Promotion } from "../../models/promotion.model.js";

export class ValidatePromotionService {
  /**
   * Validates a promotion code for an order.
   *
   * @param data - Object containing promotion code and order value.
   * @returns Promise<Object> - Resolves with validation result and discount details.
   * @throws Error if promotion is not found or invalid.
   */
  async validatePromotion(data: ValidatePromotionPayload) {
    const promotion = await Promotion.findOne({
      active: true,
      code: data.code.toUpperCase(),
    });

    if (!promotion) throw new Error("PROMOTION_NOT_FOUND");

    const now = new Date();
    if (now < promotion.startDate) {
      throw new Error("PROMOTION_NOT_STARTED");
    }

    if (now > promotion.endDate) {
      throw new Error("PROMOTION_EXPIRED");
    }

    if (data.orderValue < promotion.minOrderValue) {
      throw new Error("ORDER_VALUE_TOO_LOW");
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === "percent") {
      discountAmount =
        (data.orderValue * promotion.discountValue) /
        promotionConfig.discount.maxPercent;
    } else {
      discountAmount = promotion.discountValue;
    }

    return {
      discountAmount,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      finalAmount: data.orderValue - discountAmount,
      promotion: {
        _id: promotion._id,
        code: promotion.code,
        description: promotion.description,
      },
      valid: true,
    };
  }
}
