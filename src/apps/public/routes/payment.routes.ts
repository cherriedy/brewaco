import { createPayment } from "#common/controllers/payment/create-payment.controller.js";
import { getPaymentByOrderId } from "#common/controllers/payment/get-payment-by-order-id.controller.js";
import { getPendingPayment } from "#common/controllers/payment/get-pending-payment.controller.js";
import { getUserPayments } from "#common/controllers/payment/get-user-payments.controller.js";
import { vnpayReturn } from "#common/controllers/payment/vnpay-callback.controller.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create or retry payment for an order
 *     description: >-
 *       Creates a payment for an existing order. For COD orders, marks payment as success immediately.
 *       For online payments (VNPay), returns a payment URL to redirect the user.
 *       If a pending payment already exists, it will reuse it (payment retry).
 *       Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The order ID to create payment for
 *               orderInfo:
 *                 type: string
 *                 description: Optional payment description
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   description: Payment URL for online payment (VNPay). Redirect user here.
 *                 payment:
 *                   type: object
 *                   description: Payment record details
 *                 isRetry:
 *                   type: boolean
 *                   description: True if reusing existing pending payment
 *       400:
 *         description: Bad request - Invalid order status or unsupported payment method
 *       403:
 *         description: Forbidden - Order does not belong to user
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.post("/", createPayment);

/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments for the current user
 *     description: >-
 *       Retrieves all payment records for the authenticated user, sorted by creation date.
 *       Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get("/", getUserPayments);

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details by order ID
 *     description: >-
 *       Retrieves payment information for a specific order.
 *       Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID to get payment for
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get("/order/:orderId", getPaymentByOrderId);

/**
 * @swagger
 * /payments/pending/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Check if order has pending payment
 *     description: >-
 *       Checks if an order has a pending payment that can be retried.
 *       Returns payment details if found and still within retry period (24 hours).
 *       If payment expired, order will be auto-cancelled and returns 410 Gone.
 *       Use this to show "Checkout" button in client-side.
 *       Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID to check
 *     responses:
 *       200:
 *         description: Pending payment found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payment:
 *                   type: object
 *                   description: Pending payment details
 *       404:
 *         description: No pending payment found
 *       410:
 *         description: Payment expired, order cancelled
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get("/pending/:orderId", getPendingPayment);

/**
 * @swagger
 * /payments/vnpay/return:
 *   get:
 *     tags: [Payments]
 *     summary: VNPay payment callback
 *     description: >-
 *       Handles the callback from VNPay after payment processing.
 *       This endpoint is called by VNPay and should not be called manually.
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (transaction reference)
 *       - in: query
 *         name: vnp_ResponseCode
 *         required: true
 *         schema:
 *           type: string
 *         description: VNPay response code
 *       - in: query
 *         name: vnp_TransactionNo
 *         required: true
 *         schema:
 *           type: string
 *         description: VNPay transaction number
 *       - in: query
 *         name: vnp_SecureHash
 *         required: true
 *         schema:
 *           type: string
 *         description: Security hash for verification
 *     responses:
 *       200:
 *         description: Payment verified and processed successfully
 *       400:
 *         description: Payment failed or invalid callback
 *       404:
 *         description: Payment not found
 */
router.get("/vnpay/return", vnpayReturn);

export default router;
