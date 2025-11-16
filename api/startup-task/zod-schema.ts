import { z } from "zod";

export const startupTaskResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export type StartupTaskResponse = z.infer<typeof startupTaskResponseSchema>;
