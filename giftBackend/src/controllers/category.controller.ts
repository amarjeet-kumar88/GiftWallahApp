import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../services/category.service";


// -------------------------
// GET ALL CATEGORIES
// -------------------------
export const adminListCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(successResponse("Categories fetched", { categories }));
  } catch (error) {
    next(error);
  }
};


// -------------------------
// CREATE CATEGORY
// -------------------------
export const adminCreateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parent, slug } = req.body;

    if (!name) {
      throw new ApiError(400, "Category name is required");
    }

    const category = await createCategory({
      name,
      parent: parent || null,   // ✅ FIXED
      slug,                     // ✅ FIXED
    });

    res.status(201).json(
      successResponse("Category created", { category })
    );
  } catch (error) {
    next(error);
  }
};


// -------------------------
// UPDATE CATEGORY
// -------------------------
export const adminUpdateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parent, isActive, slug } = req.body;

    const category = await updateCategory(req.params.id, {
      name,
      parent: parent || null,   // ✅ FIXED
      isActive,
      slug,                     // ✅ FIXED
    });

    res
      .status(200)
      .json(successResponse("Category updated", { category }));
  } catch (error) {
    next(error);
  }
};


// -------------------------
// DELETE CATEGORY
// -------------------------
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
