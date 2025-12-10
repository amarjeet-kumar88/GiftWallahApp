import { ICategory, Category } from "../models/category.model";
import { ApiError } from "../utils/apiError";
import { slugify } from "../utils/slugify";

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  parent?: string | null;
}


// ----------------------------------------
// CREATE CATEGORY
// ----------------------------------------
export const createCategory = async (
  payload: CreateCategoryInput
): Promise<ICategory> => {

  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new ApiError(400, "Category with this slug already exists");
  }

  let parent: ICategory | null = null;

  if (payload.parent) {
    parent = await Category.findById(payload.parent);
    if (!parent) {
      throw new ApiError(400, "Parent category not found");
    }
  }

  const category = await Category.create({
    name: payload.name,
    slug,
    parent: parent ? parent._id : null,
  });

  return category;
};


// ----------------------------------------
// GET ALL CATEGORIES
// ----------------------------------------
export const getAllCategories = async () => {
  return Category.find().sort({ name: 1 });
};


// ----------------------------------------
// GET CATEGORY BY ID
// ----------------------------------------
export const getCategoryById = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return category;
};


// ----------------------------------------
// UPDATE CATEGORY
// ----------------------------------------
export const updateCategory = async (
  id: string,
  data: Partial<{
    name: string;
    parent: string | null;
    slug: string;
    isActive: boolean;
  }>
) => {

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (data.name !== undefined) {
    category.name = data.name;
    category.slug = data.slug
      ? slugify(data.slug)
      : slugify(data.name);
  }

  if (typeof data.isActive === "boolean") {
    category.isActive = data.isActive;
  }

  if (data.parent !== undefined) {
    if (!data.parent) {
      category.parent = null;
    } else {
      const parentCategory = await Category.findById(data.parent);
      if (!parentCategory) {
        throw new ApiError(400, "Parent category not found");
      }
      category.parent = parentCategory._id;
    }
  }

  await category.save();
  return category;
};


// ----------------------------------------
// DELETE CATEGORY
// ----------------------------------------
export const deleteCategory = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await category.deleteOne();
};

