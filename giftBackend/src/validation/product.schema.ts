import { z } from "zod";

const baseProductBody = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  brand: z.string().max(100).optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().min(1),
  attributes: z.record(z.string(), z.string()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().optional()
      })
    )
    .optional()
});

// ✅ CREATE PRODUCT
export const createProductSchema = {
  body: baseProductBody
};

// ✅ UPDATE PRODUCT
export const updateProductSchema = {
  params: z.object({
    id: z.string().min(1)
  }),
  body: baseProductBody
    .partial()
    .extend({
      price: z.number().positive().optional(),
      stock: z.number().int().nonnegative().optional()
    })
};

// ✅ PRODUCT ID PARAM
export const productIdParamSchema = {
  params: z.object({
    id: z.string().min(1)
  })
};

// ✅ LIST PRODUCTS QUERY
export const listProductsQuerySchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined)),

    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined)),

    search: z.string().optional(),
    categoryId: z.string().optional(),

    minPrice: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined)),

    maxPrice: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined)),

    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
};
