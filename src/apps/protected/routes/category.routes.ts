import { Router } from "express";
import { createCategory } from "#common/controllers/category/create-category.controller.js";
import { updateCategory } from "#common/controllers/category/update-category.controller.js";
import { deleteCategory } from "#common/controllers/category/delete-category.controller.js";
import { getCategories } from "#common/controllers/category/get-categories.controller.js";
import { getCategory } from "#common/controllers/category/get-category.controller.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
