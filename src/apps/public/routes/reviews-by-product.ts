import { getReviewsByProductId } from "#common/controllers/review/get-reviews-by-product.controller.js";
import { Router } from "express";

const router = Router();

router.get("/:id", getReviewsByProductId);

export default router;