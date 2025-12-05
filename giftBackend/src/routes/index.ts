import { Router } from "express";
// abhi ke liye dummy, baad me actual routes add karenge
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import uploadRoutes from "./upload.routes";
import addressRoutes from "./address.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import adminRoutes from "./admin.routes";
import reviewRoutes from "./review.routes";
import wishlistRoutes from "./wishlist.routes";

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API root
 *     description: Returns basic API information
 *     tags: [Misc]
 *     responses:
 *       200:
 *         description: API info
 */



export const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/upload", uploadRoutes);
router.use("/addresses", addressRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);


router.get("/", (_req, res) => {
  res.json({ message: "Ecommerce API v1" });
});
