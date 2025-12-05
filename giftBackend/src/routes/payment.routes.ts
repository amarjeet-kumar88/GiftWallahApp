import { Router } from "express";
import { verifyPaymentController } from "../controllers/payment.controller";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { verifyPaymentSchema } from "../validation/payment.schema";


/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment verification
 */

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature and mark order as paid
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified and order marked as paid
 *       400:
 *         description: Invalid signature
 */


const router = Router();

router.post("/verify", validateRequest(verifyPaymentSchema), verifyPaymentController);

export default router;
