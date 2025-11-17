import { getPromotions } from "#common/controllers/promotion/get-promotions.controller.js";
import { validatePromotion } from "#common/controllers/promotion/validate-promotion.controller.js";
import { getPromotion } from "#common/controllers/promotion/get-promotion.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getPromotions);
router.get("/:id", getPromotion);
router.post("/validate", validatePromotion);

export default router;
