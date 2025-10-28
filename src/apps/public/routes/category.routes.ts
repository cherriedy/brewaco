import { Router } from "express";
import { getCategories } from "#common/controllers/category/get-categories.controller.js";
import { getCategory } from "#common/controllers/category/get-category.controller.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

export default router;
