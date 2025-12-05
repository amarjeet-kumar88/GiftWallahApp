import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    parentId: z.string().optional().nullable()
  })
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    parentId: z.string().nullable().optional(),
    isActive: z.boolean().optional()
  })
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});
