import { Router } from "express";
import { getCartItems } from "#common/controllers/cart/get-cart-items.controller.js";
import { updateCartItem } from "#common/controllers/cart/update-cart-item.controller.js";

const router = Router();

router.get("/", getCartItems);
router.patch("/", updateCartItem);

export default router;
