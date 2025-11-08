import { z } from "zod";

export const startupTaskRequestSchema = z.object({
  device_id: z.string().min(1, "Device ID is required"),
});

export const startupTaskResponseSchema = z.object({
  data: z
    .object({
      access_token: z.string().min(1, "Access token is required"),
      device_id: z.string().min(1, "Device ID is required"),
      is_new_device: z.boolean(),
    })
    .optional(),
  message: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type StartupTaskRequest = z.infer<typeof startupTaskRequestSchema>;
export type StartupTaskResponse = z.infer<typeof startupTaskResponseSchema>;
