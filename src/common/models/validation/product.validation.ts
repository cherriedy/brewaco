import { z } from "zod";

export const createProductSchema = z.object({
  categoryId: z.string().min(1, "product.validation.categoryIdRequired"),
  description: z.string().min(1, "product.validation.descriptionRequired"),
  discount: z
    .number()
    .min(0, "product.validation.discountMin")
    .max(100, "product.validation.discountMax")
    .default(0),
  images: z.array(z.string()).default([]),
  name: z.string().min(1, "product.validation.nameRequired"),
  origin: z.string().min(1, "product.validation.originRequired"),
  price: z.number().min(0, "product.validation.priceMin"),
  ratingsAverage: z.number().min(0).max(5).default(0).optional(),
  ratingsCount: z.number().min(0).default(0).optional(),
  slug: z.string().optional(),
  stock: z.number().min(0, "product.validation.stockMin").default(0),
  type: z.string().min(1, "product.validation.typeRequired"),
  weight: z.string().min(1, "product.validation.weightRequired"),
});

export const updateProductSchema = z.object({
  categoryId: z
    .string()
    .min(1, "product.validation.categoryIdRequired")
    .optional(),
  description: z
    .string()
    .min(1, "product.validation.descriptionRequired")
    .optional(),
  discount: z
    .number()
    .min(0, "product.validation.discountMin")
    .max(100, "product.validation.discountMax")
    .optional(),
  images: z.array(z.string()).optional(),
  name: z.string().min(1, "product.validation.nameRequired").optional(),
  origin: z.string().min(1, "product.validation.originRequired").optional(),
  price: z.number().min(0, "product.validation.priceMin").optional(),
  // ratingsAverage: z.number().min(0).max(5).optional(),
  // ratingsCount: z.number().min(0).optional(),
  slug: z.string().optional(),
  stock: z.number().min(0, "product.validation.stockMin").optional(),
  type: z.string().min(1, "product.validation.typeRequired").optional(),
  weight: z.string().min(1, "product.validation.weightRequired").optional(),
});

export type CreateProductPayload = z.infer<typeof createProductSchema>;
export type UpdateProductPayload = z.infer<typeof updateProductSchema>;
