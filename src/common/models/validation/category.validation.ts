import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "category.validation.nameRequired"),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "category.validation.nameRequired").optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;
