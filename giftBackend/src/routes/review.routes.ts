import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  addOrUpdateReviewController,
  deleteReviewController,
  getProductReviewsController
} from "../controllers/review.controller";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import {
  addOrUpdateReviewSchema,
  reviewProductParamSchema
} from "../validation/review.schema";

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews and ratings
 */

/**
 * @swagger
 * /api/reviews/{productId}:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */

/**
 * @swagger
 * /api/reviews/{productId}:
 *   post:
 *     summary: Add or update review for a product
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review saved
 */

/**
 * @swagger
 * /api/reviews/{productId}:
 *   delete:
 *     summary: Delete current user's review for a product
 *     tags: [Reviews]
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
 *         description: Review deleted
 */


const router = Router();

// Public
router.get(
  "/:productId",
  validateRequest(reviewProductParamSchema),
  getProductReviewsController
);

// Auth required
router.post(
  "/:productId",
  authMiddleware,
  validateRequest(addOrUpdateReviewSchema),
  addOrUpdateReviewController
);

router.delete(
  "/:productId",
  authMiddleware,
  validateRequest(reviewProductParamSchema),
  deleteReviewController
);

export default router;
