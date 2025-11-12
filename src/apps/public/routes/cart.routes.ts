import { getCartItems } from "#common/controllers/cart/get-cart-items.controller.js";
import { updateCartItem } from "#common/controllers/cart/update-cart-item.controller.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get user's cart
 *     description: Retrieve the current user's shopping cart with all items (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                           quantity:
 *                             type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/", getCartItems);

/**
 * @swagger
 * /cart:
 *   patch:
 *     tags: [Cart]
 *     summary: Update cart item
 *     description: Add or update an item in the cart (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [item]
 *             properties:
 *               item:
 *                 type: object
 *                 required: [productId, quantity]
 *                 properties:
 *                   productId:
 *                     type: string
 *                     description: Product ID to add/update
 *                   quantity:
 *                     type: integer
 *                     minimum: 0
 *                     description: Quantity (0 to remove item)
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.patch("/", updateCartItem);

export default router;
