import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

import {
  adminCreateCategoryController,
  adminUpdateCategoryController,
  adminDeleteCategoryController,
  adminListCategoriesController,
} from "../controllers/category.controller";

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product categories
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all active categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (admin)
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (admin)
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (admin)
 *     tags: [Categories]
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
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */


const router = Router();
router.use(authMiddleware, adminMiddleware);

// ✅ List all categories
router.get("/", adminListCategoriesController);

// ✅ Create category
router.post("/", adminCreateCategoryController);

// ✅ Update category
router.put("/:id", adminUpdateCategoryController);

// ✅ Delete category
router.delete("/:id", adminDeleteCategoryController);

export default router;
