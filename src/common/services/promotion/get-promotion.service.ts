import mongoose from "mongoose";

import { Promotion } from "../../models/promotion.model.js";

export class GetPromotionService {
  /**
   * Retrieves a single promotion by its ID.
   *
   * @param id - The promotion ID to retrieve.
   * @returns Promise<Promotion> - Resolves with the promotion instance on success.
   * @throws Error if the ID is invalid or promotion is not found.
   */
  async getPromotion(id: string) {
    // Validate the id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_PROMOTION_ID");
    }

    const promotion = await Promotion.findById(id);
    if (!promotion) throw new Error("PROMOTION_NOT_FOUND");

    return promotion;
  }
}
