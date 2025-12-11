import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { upload } from "../middlewares/upload.middleware";

import {
  adminListOrdersController,
  adminGetOrderController,
  adminUpdateOrderStatusController,
  adminUpdatePaymentStatusController,

  adminListProductsController,
  adminCreateProductController,
  adminUpdateProductController,
  adminUpdateProductStockController,
  adminToggleProductActiveController,

  adminListCategoriesController,
  adminCreateCategoryController,
  adminUpdateCategoryController,
  adminDeleteCategoryController,
  adminUploadProductImageController,
} from "../controllers/admin.controller";

const router = Router();

// admin auth protection
router.use(authMiddleware, adminMiddleware);


// ------------------------
// ORDERS
// ------------------------
router.get("/orders", adminListOrdersController);
router.get("/orders/:id", adminGetOrderController);
router.patch("/orders/:id/status", adminUpdateOrderStatusController);
router.patch("/orders/:id/payment-status", adminUpdatePaymentStatusController);

router.post("/products/upload", upload.single("image"), adminUploadProductImageController);
// ------------------------
// PRODUCTS
// ------------------------
router.get("/products", adminListProductsController);
router.post("/products", adminCreateProductController);
router.patch("/products/:id", adminUpdateProductController);
router.patch("/products/:id/stock", adminUpdateProductStockController);
router.patch("/products/:id/active", adminToggleProductActiveController);


// ------------------------
// CATEGORIES
// ------------------------
router.get("/categories", adminListCategoriesController);
router.post("/categories", adminCreateCategoryController);
router.patch("/categories/:id", adminUpdateCategoryController);
router.delete("/categories/:id", adminDeleteCategoryController);


export default router;
