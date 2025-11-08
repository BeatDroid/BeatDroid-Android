import DeviceInfo from "react-native-device-info";
import { apiClient } from "../client/ky-instance";
import {
  startupTaskRequestSchema,
  type StartupTaskResponse,
  startupTaskResponseSchema,
} from "./zod-schema";

export async function executeStartupTask(): Promise<StartupTaskResponse> {
  try {
    const instanceId = await DeviceInfo.getInstanceId();
    const requestData = startupTaskRequestSchema.parse({
      device_id: instanceId,
    });

    const response = await apiClient
      .extend({
        timeout: 10000,
      })
      .post("auth/login", {
        json: requestData,
      })
      .json<unknown>();

    return startupTaskResponseSchema.parse(response);
  } catch (error) {
    console.error("Error executing startup task:", error);
    throw error;
  }
}
