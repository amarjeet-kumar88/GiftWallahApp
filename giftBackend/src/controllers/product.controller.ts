import { Request, Response, NextFunction } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
} from "../services/product.service";
import { successResponse } from "../utils/apiResponse";

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
