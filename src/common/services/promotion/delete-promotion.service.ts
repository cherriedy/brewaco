import mongoose from "mongoose";

import { Promotion } from "../../models/promotion.model.js";

export class DeletePromotionService {
  /**
   * Deletes a promotion by its ID.
   *
   * @param id - The promotion ID to delete.
   * @returns Promise<Promotion> - Resolves with the deleted promotion instance on success.
   * @throws Error if the ID is invalid or promotion is not found.
   */
  async deletePromotion(id: string) {
    // Validate the id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_PROMOTION_ID");
    }

    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) throw new Error("PROMOTION_NOT_FOUND");

    return promotion;
  }
}
