import { deleteImageFromCloudinary } from "./storage.service";
import { Product, IProduct } from "../models/product.model";
import { Category } from "../models/category.model";
import { ApiError } from "../utils/apiError";
import { slugify } from "../utils/slugify";

interface CreateProductInput {
  name: string;
  description?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  stock: number;
  categoryId: string;
  attributes?: Record<string, string>;
  images?: { url: string; publicId?: string }[];
}

interface ListProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const createProduct = async (
  data: CreateProductInput
): Promise<IProduct> => {
  const category = await Category.findById(data.categoryId);
  if (!category) {
    throw new ApiError(400, "Category not found");
  }

  const slug = slugify(data.name);

  const existing = await Product.findOne({ slug });
  if (existing) {
    throw new ApiError(400, "Product with this name already exists");
  }

  const product = await Product.create({
    name: data.name,
    slug,
    description: data.description,
    brand: data.brand,
    price: data.price,
    salePrice: data.salePrice,
    stock: data.stock,
    category: category._id,
    attributes: data.attributes || {},
    images: data.images || []
  });

  return product;
};

export const getProductById = async (id: string) => {
  const product = await Product.findById(id).populate("category");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const updateProduct = async (
  id: string,
  data: Partial<CreateProductInput>
) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (data.name) {
    product.name = data.name;
    product.slug = slugify(data.name);
  }
  if (data.description !== undefined) product.description = data.description;
  if (data.brand !== undefined) product.brand = data.brand;
  if (data.price !== undefined) product.price = data.price;
  if (data.salePrice !== undefined) product.salePrice = data.salePrice;
  if (data.stock !== undefined) product.stock = data.stock;
  if (data.attributes) product.attributes = data.attributes as any;
  if (data.images) product.images = data.images;

  if (data.categoryId) {
    const category = await Category.findById(data.categoryId);
    if (!category) {
      throw new ApiError(400, "Category not found");
    }
    product.category = category._id;
  }

  await product.save();
  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Try delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.publicId) {
        await deleteImageFromCloudinary(img.publicId);
      }
    }
  }

  await product.deleteOne();
};

export const listProducts = async (query: ListProductsQuery) => {
  const {
    page = 1,
    limit = 12,
    search,
    categoryId,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = query;

  const filter: any = { isActive: true };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (categoryId) {
    filter.category = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const sort: any = {
    [sortBy]: sortOrder === "asc" ? 1 : -1
  };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
};
