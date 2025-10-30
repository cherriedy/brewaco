import { getProduct } from "#common/controllers/product/get-product.controller.js";
import { getProducts } from "#common/controllers/product/get-products.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

export default router;
