import { createReview } from "#common/controllers/review/create-review.controller.js";
import { getReviewsByOrder } from "#common/controllers/review/get-reviews-by-order.controller.js";
import { updateReview } from "#common/controllers/review/update-review.controller.js";
import { ensurePurchasedMiddleware } from "#common/middlewares/ensure-purchased.middleware.js";
import { Router } from "express";

const router = Router();

router.get("/order/:orderId", getReviewsByOrder);
/**
 * @swagger
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a product
 *     description: Create a new review for a product. User must have purchased the product and can only review once.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Review comment text
 *     responses:
 *       200:
 *         description: Review created successfully
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
 *       400:
 *         description: Invalid input or validation error
 *       403:
 *         description: User has not purchased the product
 *       404:
 *         description: Product not found
 *       409:
 *         description: User already reviewed this product
 */
router.post("/", ensurePurchasedMiddleware, createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update a review
 *     description: Update an existing review. User must own the review and update within 24 hours of creation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Review comment text
 *     responses:
 *       200:
 *         description: Review updated successfully
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
 *       400:
 *         description: Invalid input or validation error
 *       403:
 *         description: User does not own the review or update period expired
 *       404:
 *         description: Review not found
 */
router.put("/:id", updateReview);

export default router;
