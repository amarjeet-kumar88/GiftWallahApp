import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
} from "../controllers/checkout.controller";

const router = Router();

router.use(authMiddleware);

router.post("/create-order", createRazorpayOrderController);
router.post("/verify-payment", verifyRazorpayPaymentController);

export default router;
