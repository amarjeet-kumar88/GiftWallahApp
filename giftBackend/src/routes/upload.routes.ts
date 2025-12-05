import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import { uploadProductImageController } from "../controllers/upload.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";


/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload (Cloudinary)
 */

/**
 * @swagger
 * /api/upload/product:
 *   post:
 *     summary: Upload a product image (admin)
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file or missing file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */


const router = Router();

// Admin-only product image upload
router.post(
  "/product",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  uploadProductImageController
);

export default router;
