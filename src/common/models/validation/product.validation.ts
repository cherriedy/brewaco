import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "product.validation.nameRequired"),
  slug: z.string().optional(),
  categoryId: z.string().min(1, "product.validation.categoryIdRequired"),
  description: z.string().min(1, "product.validation.descriptionRequired"),
  price: z.number().min(0, "product.validation.priceMin"),
  discount: z
    .number()
    .min(0, "product.validation.discountMin")
    .max(100, "product.validation.discountMax")
    .default(0),
  stock: z.number().min(0, "product.validation.stockMin").default(0),
  images: z.array(z.string()).default([]),
  origin: z.string().min(1, "product.validation.originRequired"),
  type: z.string().min(1, "product.validation.typeRequired"),
  weight: z.string().min(1, "product.validation.weightRequired"),
  ratingsAverage: z.number().min(0).max(5).default(0).optional(),
  ratingsCount: z.number().min(0).default(0).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "product.validation.nameRequired").optional(),
  slug: z.string().optional(),
  categoryId: z
    .string()
    .min(1, "product.validation.categoryIdRequired")
    .optional(),
  description: z
    .string()
    .min(1, "product.validation.descriptionRequired")
    .optional(),
  price: z.number().min(0, "product.validation.priceMin").optional(),
  discount: z
    .number()
    .min(0, "product.validation.discountMin")
    .max(100, "product.validation.discountMax")
    .optional(),
  stock: z.number().min(0, "product.validation.stockMin").optional(),
  images: z.array(z.string()).optional(),
  origin: z.string().min(1, "product.validation.originRequired").optional(),
  type: z.string().min(1, "product.validation.typeRequired").optional(),
  weight: z.string().min(1, "product.validation.weightRequired").optional(),
  ratingsAverage: z.number().min(0).max(5).optional(),
  ratingsCount: z.number().min(0).optional(),
});

export type CreateProductPayload = z.infer<typeof createProductSchema>;
export type UpdateProductPayload = z.infer<typeof updateProductSchema>;
