import { Router } from "express";
import {
  getCartController,
  addOrUpdateCartItemController,
  removeCartItemController,
  clearCartController
} from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add or update item in cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart updated
 */
/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     summary: Remove an item from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear the cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 *       401:
 *         description: Unauthorized
 */



const router = Router();

router.use(authMiddleware);

router.get("/", getCartController);
router.post("/items", addOrUpdateCartItemController);
// productId = Product ka _id
router.delete("/items/:productId", removeCartItemController);
router.delete("/", clearCartController);

export default router;
