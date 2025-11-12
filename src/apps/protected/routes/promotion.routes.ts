import { createPromotion } from "#common/controllers/promotion/create-promotion.controller.js";
import { deletePromotion } from "#common/controllers/promotion/delete-promotion.controller.js";
import { getPromotion } from "#common/controllers/promotion/get-promotion.controller.js";
import { getPromotions } from "#common/controllers/promotion/get-promotions.controller.js";
import { updatePromotion } from "#common/controllers/promotion/update-promotion.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getPromotions);
router.get("/:id", getPromotion);
router.post("/", createPromotion);
router.put("/:id", updatePromotion);
router.delete("/:id", deletePromotion);

export default router;
