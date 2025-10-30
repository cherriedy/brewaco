import { getCartItems } from "#common/controllers/cart/get-cart-items.controller.js";
import { updateCartItem } from "#common/controllers/cart/update-cart-item.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getCartItems);
router.patch("/", updateCartItem);

export default router;
