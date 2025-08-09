import { z } from "zod";

export const genTokenRequestSchema = z.object({
  device_id: z.string().min(1, "Device ID is required"),
});

export const genTokenResponseSchema = z.object({
  data: z.object({
    access_token: z.string().min(1, "Access token is required"),
    device_id: z.string().min(1, "Device ID is required"),
    is_new_device: z.boolean(),
  }).optional(),
  message: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type GenTokenRequest = z.infer<typeof genTokenRequestSchema>;
export type GenTokenResponse = z.infer<typeof genTokenResponseSchema>;
