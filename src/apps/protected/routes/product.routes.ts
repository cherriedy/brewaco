import { createProduct } from "#common/controllers/product/create-product.controller.js";
import { deleteProduct } from "#common/controllers/product/delete-product.controller.js";
import { getProduct } from "#common/controllers/product/get-product.controller.js";
import { getProducts } from "#common/controllers/product/get-products.controller.js";
import { updateProduct } from "#common/controllers/product/update-product.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
