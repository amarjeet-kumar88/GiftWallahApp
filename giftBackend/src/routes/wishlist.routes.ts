import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  addToWishlistController,
  clearWishlistController,
  getWishlistController,
  isInWishlistController,
  removeFromWishlistController,
  getWishlistCountController,
} from "../controllers/wishlist.controller";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import {
  wishlistAddSchema,
  wishlistProductParamSchema
} from "../validation/wishlist.schema";

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist operations
 */

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add a product to wishlist
 *     tags: [Wishlist]
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
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Added to wishlist
 */

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from wishlist
 *     tags: [Wishlist]
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
 *         description: Removed from wishlist
 */

/**
 * @swagger
 * /api/wishlist:
 *   delete:
 *     summary: Clear wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
 */

/**
 * @swagger
 * /api/wishlist/check/{productId}:
 *   get:
 *     summary: Check if a product is in wishlist
 *     tags: [Wishlist]
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
 *         description: Returns inWishlist boolean
 */


const router = Router();

router.use(authMiddleware);

router.get("/", getWishlistController);
router.get("/count", getWishlistCountController);

router.post(
  "/",
  validateRequest(wishlistAddSchema),
  addToWishlistController
);

router.delete(
  "/:productId",
  validateRequest(wishlistProductParamSchema),
  removeFromWishlistController
);

router.delete("/", clearWishlistController);

router.get(
  "/check/:productId",
  validateRequest(wishlistProductParamSchema),
  isInWishlistController
);

export default router;
