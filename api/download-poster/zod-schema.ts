import { z } from "zod";

export const getPosterRequestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
});

export const getPosterResponseSchema = z.object({
  image: z.string().min(1, "Image data is required"),
});

export type GetPosterRequest = z.infer<typeof getPosterRequestSchema>;
export type GetPosterResponse = z.infer<typeof getPosterResponseSchema>;
