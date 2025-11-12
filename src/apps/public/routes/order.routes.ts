import { cancelOrder } from "#common/controllers/order/cancel-order.controller.js";
import { createOrder } from "#common/controllers/order/create-order.controller.js";
import { getOrderById } from "#common/controllers/order/get-order-by-id.controller.js";
import { getOrders } from "#common/controllers/order/get-orders.controller.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place a new order
 *     description: >-
 *       Submit a new order with one or more items, payment method, and shipping details.
 *       Requires authentication. Returns the created order details on success.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, totalAmount, paymentMethod, shippingAddress]
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 description: List of products to order
 *                 items:
 *                   type: object
 *                   required: [productId, name, price, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: Unique product identifier
 *                     name:
 *                       type: string
 *                       description: Product name
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       description: Price per unit
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Number of units ordered
 *               totalAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Total order amount (after discounts)
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, VNPay, Momo, Card]
 *                 description: Payment method (Cash on Delivery, VNPay, Momo, Card)
 *               shippingAddress:
 *                 type: object
 *                 required: [street, city, zip, country]
 *                 description: Shipping address for the order
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: Street address
 *                   city:
 *                     type: string
 *                     description: City
 *                   state:
 *                     type: string
 *                     description: State or province
 *                   zip:
 *                     type: string
 *                     description: Postal code
 *                   country:
 *                     type: string
 *                     description: Country
 *                   phone:
 *                     type: string
 *                     description: Recipient's phone number
 *                   recipientName:
 *                     type: string
 *                     description: Name of the recipient
 *               promotionCode:
 *                 type: string
 *                 description: Optional promotion code
 *               notes:
 *                 type: string
 *                 description: Optional order notes
 *     responses:
 *       201:
 *         description: >-
 *           Order created successfully. Returns the order details and confirmation message.
 *       400:
 *         description: >-
 *           Bad request. The order data is invalid or missing required fields.
 *       401:
 *         description: >-
 *           Unauthorized. Authentication is required to place an order.
 */
router.post("/", createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List all orders for the authenticated user
 *     description: >-
 *       Retrieve a paginated list of orders placed by the current user. Supports filtering by status.
 *       Requires authentication. Returns order list and pagination info.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CREATED, PAID, SHIPPED, DELIVERED, CANCELED]
 *         description: Filter orders by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: >-
 *           Orders retrieved successfully. Returns a list of orders and pagination details.
 *       401:
 *         description: >-
 *           Unauthorized. You must be logged in to view your orders.
 */
router.get("/", getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get details of a specific order
 *     description: >-
 *       Retrieve detailed information about a single order by its ID. Requires authentication.
 *       Returns order details if found.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique order ID
 *     responses:
 *       200:
 *         description: >-
 *           Order found. Returns the order details.
 *       404:
 *         description: >-
 *           Order not found. The specified ID does not exist or does not belong to the user.
 *       401:
 *         description: >-
 *           Unauthorized. You must be logged in to view order details.
 */
router.get("/:id", getOrderById);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel an existing order
 *     description: >-
 *       Cancel a pending order by its ID. Only orders with status 'CREATED' or 'PAID' can be cancelled.
 *       Requires authentication. Returns updated order details if successful.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique order ID to cancel
 *     responses:
 *       200:
 *         description: >-
 *           Order cancelled successfully. Returns the updated order details and confirmation message.
 *       400:
 *         description: >-
 *           Cannot cancel order. The order is not in CREATED or PAID status, or cancellation is not allowed.
 *       404:
 *         description: >-
 *           Order not found. The specified ID does not exist or does not belong to the user.
 *       401:
 *         description: >-
 *           Unauthorized. You must be logged in to cancel orders.
 */
router.patch("/:id/cancel", cancelOrder);

export default router;
