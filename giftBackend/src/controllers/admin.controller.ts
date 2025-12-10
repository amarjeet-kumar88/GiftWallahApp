import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { successResponse } from "../utils/apiResponse";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ------------------------------------------
// ORDERS
// ------------------------------------------

// GET /api/admin/orders
export const adminListOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, paymentStatus, page = "1", limit = "20" } = req.query;

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
        pages: Math.ceil(total / limitNum),
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

    res.status(200).json(successResponse("Order fetched", { order }));
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
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    order.status = status;
    await order.save();

    res.status(200).json(successResponse("Order status updated", { order }));
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
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json(
      successResponse("Payment status updated", { order })
    );
  } catch (error) {
    next(error);
  }
};


// ------------------------------------------
// PRODUCTS
// ------------------------------------------


// GET /api/admin/products
export const adminListProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search = "" } = req.query;

    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(successResponse("Products fetched", { products }));
  } catch (error) {
    next(error);
  }
};


// POST /api/admin/products
export const adminCreateProductController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      stock,
      brand,
      categoryId,
      isActive,
      imageUrls,
      slug,
    } = req.body;

    if (!name || !price) {
      throw new ApiError(400, "Name and price are required");
    }

    const finalSlug = (slug && slug.trim().length > 0)
      ? toSlug(slug)
      : toSlug(name);


    const images =
      Array.isArray(imageUrls)
        ? imageUrls.map((url: string) => ({ url }))
        : typeof imageUrls === "string" && imageUrls.trim().length
        ? imageUrls.split(",").map((u) => ({ url: u.trim() }))
        : [];

    const product = await Product.create({
      name,
      slug: finalSlug, 
      description,
      price,
      salePrice: salePrice || null,
      stock: stock ?? 0,
      brand,
      category: categoryId || null,
      isActive: isActive ?? true,
      images,
    });

    res.status(201).json(successResponse("Product created", { product }));
  } catch (err) {
    next(err);
  }
};


// PATCH /api/admin/products/:id
export const adminUpdateProductController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      salePrice,
      stock,
      brand,
      categoryId,
      isActive,
      imageUrls,
      slug,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (salePrice !== undefined) product.salePrice = salePrice;
    if (stock !== undefined) product.stock = stock;
    if (brand !== undefined) product.brand = brand;
    if (categoryId !== undefined) product.category = categoryId;
    if (isActive !== undefined) product.isActive = isActive;
    if (slug !== undefined) {
      (product as any).slug =
        slug.trim().length > 0 ? toSlug(slug) : toSlug(product.name);
    }

    if (imageUrls !== undefined) {
      const images =
        Array.isArray(imageUrls)
          ? imageUrls.map((url: string) => ({ url }))
          : typeof imageUrls === "string" && imageUrls.trim().length
          ? imageUrls.split(",").map((u) => ({ url: u.trim() }))
          : [];
      (product as any).images = images;
    }

    await product.save();

    res.status(200).json(successResponse("Product updated", { product }));
  } catch (err) {
    next(err);
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



// ------------------------------------------
// CATEGORIES
// ------------------------------------------

// GET /api/admin/categories
export const adminListCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategories();
    res
      .status(200)
      .json(successResponse("Categories fetched", { categories }));
  } catch (error) {
    next(error);
  }
};


// POST /api/admin/categories
export const adminCreateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug, parentId } = req.body;
    if (!name) throw new ApiError(400, "Category name is required");

    const category = await createCategory({
      name,
      slug,               // ✅ now VALID
      parent: parentId || null,
    });

    res
      .status(201)
      .json(successResponse("Category created", { category }));
  } catch (error) {
    next(error);
  }
};


// PATCH /api/admin/categories/:id
export const adminUpdateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug, parentId } = req.body;

    const category = await updateCategory(req.params.id, {
      name,
      slug,
      parent: parentId || null,
    });

    res
      .status(200)
      .json(successResponse("Category updated", { category }));
  } catch (error) {
    next(error);
  }
};


// DELETE /api/admin/categories/:id
export const adminDeleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteCategory(req.params.id);
    res
      .status(200)
      .json(successResponse("Category deleted", {}));
  } catch (error) {
    next(error);
  }
};
