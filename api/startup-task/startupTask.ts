import { apiClient } from "../client/ky-instance";
import {
  type StartupTaskResponse,
  startupTaskResponseSchema,
} from "./zod-schema";

export async function executeStartupTask(): Promise<StartupTaskResponse> {
  try {
    const response = await apiClient
      .extend({
        timeout: 60000,
      })
      .get("")
      .json<unknown>();

    return startupTaskResponseSchema.parse(response);
  } catch (error) {
    console.error("Error executing startup task:", error);
    throw error;
  }
}
