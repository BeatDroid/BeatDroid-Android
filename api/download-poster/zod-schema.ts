import { z } from "zod";

export const getPosterRequestSchema = z
  .string()
  .min(1, "Poster filename or static path is required");

export const getPosterResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      image: z.string(),
      filename: z.string(),
    })
    .optional(),
  error: z.string().optional(),
  details: z.string().optional(),
});

export type GetPosterRequest = z.infer<typeof getPosterRequestSchema>;
export type GetPosterResponse = z.infer<typeof getPosterResponseSchema>;
