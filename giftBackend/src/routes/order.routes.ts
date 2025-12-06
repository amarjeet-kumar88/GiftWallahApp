import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getMyOrdersController,
  getMyOrderByIdController,
} from "../controllers/order.controller";

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order operations
 */

/**
 * @swagger
 * /api/orders/cod:
 *   post:
 *     summary: Create COD order from cart
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *             properties:
 *               addressId:
 *                 type: string
 *     responses:
 *       201:
 *         description: COD order created
 */

/**
 * @swagger
 * /api/orders/online/init:
 *   post:
 *     summary: Initiate online payment order (Razorpay)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *             properties:
 *               addressId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Razorpay order created and local order saved
 */
/**
 * @swagger
 * /api/orders/me:
 *   get:
 *     summary: Get all orders of current user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *       401:
 *         description: Unauthorized
 */


const router = Router();

router.use(authMiddleware);

router.get("/", getMyOrdersController);
router.get("/:orderId", getMyOrderByIdController);

export default router;
