import { Request, Response, NextFunction } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../services/category.service";
import { successResponse } from "../utils/apiResponse";

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parentId } = req.body;
    const category = await createCategory({ name, parentId });
    res
      .status(201)
      .json(successResponse("Category created successfully", { category }));
  } catch (error) {
    next(error);
  }
};

export const getCategoriesController = async (
  _req: Request,
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

export const getCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await getCategoryById(req.params.id);
    res.status(200).json(successResponse("Category fetched", { category }));
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parentId, isActive } = req.body;
    const category = await updateCategory(req.params.id, {
      name,
      parentId,
      isActive
    });
    res
      .status(200)
      .json(successResponse("Category updated successfully", { category }));
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteCategory(req.params.id);
    res.status(200).json(successResponse("Category deleted successfully"));
  } catch (error) {
    next(error);
  }
};
