import { Router } from "express";
import { getProducts } from "#common/controllers/product/get-products.controller.js";
import { getProduct } from "#common/controllers/product/get-product.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

export default router;
