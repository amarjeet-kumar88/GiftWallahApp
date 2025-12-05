import { ICategory } from "../models/category.model";
import { Category } from "../models/category.model";
import { ApiError } from "../utils/apiError";
import { slugify } from "../utils/slugify";

interface CreateCategoryInput {
  name: string;
  parentId?: string;
}

export const createCategory = async (
  payload: CreateCategoryInput
): Promise<ICategory> => {
  const slug = slugify(payload.name);

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new ApiError(400, "Category with this name already exists");
  }

  let parent: ICategory | null = null;
  if (payload.parentId) {
    parent = await Category.findById(payload.parentId);
    if (!parent) {
      throw new ApiError(400, "Parent category not found");
    }
  }

  const category = await Category.create({
    name: payload.name,
    slug,
    parent: parent ? parent._id : null
  });

  return category;
};

export const getAllCategories = async () => {
  const categories = await Category.find({ isActive: true }).sort({
    name: 1
  });
  return categories;
};

export const getCategoryById = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return category;
};

export const updateCategory = async (
  id: string,
  data: Partial<{ name: string; parentId?: string; isActive: boolean }>
) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (data.name) {
    category.name = data.name;
    category.slug = slugify(data.name);
  }

  if (typeof data.isActive === "boolean") {
    category.isActive = data.isActive;
  }

  if (data.parentId !== undefined) {
    if (!data.parentId) {
      category.parent = null;
    } else {
      const parent = await Category.findById(data.parentId);
      if (!parent) {
        throw new ApiError(400, "Parent category not found");
      }
      category.parent = parent._id;
    }
  }

  await category.save();
  return category;
};

export const deleteCategory = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  await category.deleteOne();
};
