import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { successResponse } from "../utils/apiResponse";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";

// GET /api/admin/orders?status=&paymentStatus=&page=&limit=
export const adminListOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      paymentStatus,
      page = "1",
      limit = "20"
    } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("user", "name phone email"),
      Order.countDocuments(filter)
    ]);

    res.status(200).json(
      successResponse("Admin orders fetched", {
        orders,
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders/:id
export const adminGetOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name phone email")
      .populate("items.product");

    if (!order) throw new ApiError(404, "Order not found");

    res
      .status(200)
      .json(successResponse("Order fetched", { order }));
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/orders/:id/status
export const adminUpdateOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body; // created/confirmed/shipped/delivered/cancelled

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    order.status = status;
    await order.save();

    res
      .status(200)
      .json(successResponse("Order status updated", { order }));
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/orders/:id/payment-status
export const adminUpdatePaymentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentStatus } = req.body; // pending/paid/failed

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    order.paymentStatus = paymentStatus;
    await order.save();

    res
      .status(200)
      .json(successResponse("Payment status updated", { order }));
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/products?search=&page=&limit=
export const adminListProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, page = "1", limit = "20" } = req.query;

    const filter: any = {};
    if (search) {
      filter.name = { $regex: String(search), $options: "i" };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("category"),
      Product.countDocuments(filter)
    ]);

    res.status(200).json(
      successResponse("Admin products fetched", {
        products,
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      })
    );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:id/stock
export const adminUpdateProductStockController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");

    product.stock = Number(stock);
    await product.save();

    res
      .status(200)
      .json(successResponse("Product stock updated", { product }));
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/products/:id/active
export const adminToggleProductActiveController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isActive } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");

    product.isActive = Boolean(isActive);
    await product.save();

    res
      .status(200)
      .json(successResponse("Product active status updated", { product }));
  } catch (error) {
    next(error);
  }
};
