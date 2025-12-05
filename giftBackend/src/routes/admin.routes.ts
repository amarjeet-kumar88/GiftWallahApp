import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import {
  adminGetOrderController,
  adminListOrdersController,
  adminUpdateOrderStatusController,
  adminUpdatePaymentStatusController,
  adminListProductsController,
  adminUpdateProductStockController,
  adminToggleProductActiveController
} from "../controllers/admin.controller";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations (orders, products)
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Admin - list orders with filters
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, confirmed, shipped, delivered, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 *       403:
 *         description: Forbidden (not admin)
 */

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Admin - get order details
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Admin - update order status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [created, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 */

/**
 * @swagger
 * /api/admin/orders/{id}/payment-status:
 *   patch:
 *     summary: Admin - update payment status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *     responses:
 *       200:
 *         description: Payment status updated
 */

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Admin - list products
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products
 */

/**
 * @swagger
 * /api/admin/products/{id}/stock:
 *   patch:
 *     summary: Admin - update product stock
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock updated
 */

/**
 * @swagger
 * /api/admin/products/{id}/active:
 *   patch:
 *     summary: Admin - toggle product active status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Active status updated
 */


const router = Router();

// sabhi admin routes protected
router.use(authMiddleware, adminMiddleware);

// Orders
router.get("/orders", adminListOrdersController);
router.get("/orders/:id", adminGetOrderController);
router.patch("/orders/:id/status", adminUpdateOrderStatusController);
router.patch("/orders/:id/payment-status", adminUpdatePaymentStatusController);

// Products
router.get("/products", adminListProductsController);
router.patch("/products/:id/stock", adminUpdateProductStockController);
router.patch("/products/:id/active", adminToggleProductActiveController);

export default router;
