import { Request, Response, NextFunction } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
} from "../services/product.service";
import { successResponse } from "../utils/apiResponse";
import { Product } from "../models/product.model";

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      brand,
      price,
      salePrice,
      stock,
      categoryId,
      attributes,
      images
    } = req.body;

    const product = await createProduct({
      name,
      description,
      brand,
      price: Number(price),
      salePrice: salePrice !== undefined ? Number(salePrice) : undefined,
      stock: Number(stock),
      categoryId,
      attributes,
      images
    });

    res
      .status(201)
      .json(successResponse("Product created successfully", { product }));
  } catch (error) {
    next(error);
  }
};

export const getProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await getProductById(req.params.id);
    res.status(200).json(successResponse("Product fetched", { product }));
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      brand,
      price,
      salePrice,
      stock,
      categoryId,
      attributes,
      images
    } = req.body;

    const product = await updateProduct(req.params.id, {
      name,
      description,
      brand,
      price: price !== undefined ? Number(price) : undefined,
      salePrice: salePrice !== undefined ? Number(salePrice) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      categoryId,
      attributes,
      images
    });

    res
      .status(200)
      .json(successResponse("Product updated successfully", { product }));
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteProduct(req.params.id);
    res.status(200).json(successResponse("Product deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const listProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page,
      limit,
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder
    } = req.query;

    const result = await listProducts({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search ? String(search) : undefined,
      categoryId: categoryId ? String(categoryId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === "asc" || sortOrder === "desc"
        ? (sortOrder as "asc" | "desc")
        : undefined
    });

    res
      .status(200)
      .json(successResponse("Products fetched", result));
  } catch (error) {
    next(error);
  }
};

export const suggestProductsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string) || "";
    const limit = Math.min(50, Number(req.query.limit) || 6);

    if (!q || q.trim().length === 0) {
      return res.status(200).json(successResponse("No query", { suggestions: [] }));
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let docs: any[] = [];

    // Try $text search first (fast) — but protect with try/catch because index may be missing
    if (q.trim().length >= 2) {
      try {
        docs = await Product.find(
          { $text: { $search: q }, isActive: true },
          { score: { $meta: "textScore" }, name: 1, price: 1, salePrice: 1, images: 1, category: 1 }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(limit)
          .lean();
      } catch (err: any) {
        // If text index missing or any other error, we'll fallback to regex below
        console.warn("Text search failed, falling back to regex search:", err?.message || err);
        docs = [];
      }
    }

    // If no docs found (or short query) then fallback to regex
    if (!docs || docs.length === 0) {
      const regex = new RegExp(escaped, "i");
      docs = await Product.find(
        { name: regex, isActive: true },
        { name: 1, price: 1, salePrice: 1, images: 1, category: 1 }
      )
        .limit(limit)
        .lean();
    }

    const suggestions = docs.map((d: any) => ({
      _id: d._id,
      name: d.name,
      price: d.price,
      salePrice: d.salePrice,
      images: d.images?.slice(0, 1) ?? [],
      categoryName: d.category?.name || undefined,
    }));

    return res.status(200).json(successResponse("Suggestions", { suggestions }));
  } catch (err) {
    next(err);
  }
};