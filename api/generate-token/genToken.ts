import DeviceInfo from "react-native-device-info";
import { apiClient } from "../client/ky-instance";
import {
  genTokenRequestSchema,
  genTokenResponseSchema,
  type GenTokenResponse,
} from "./zod-schema";

export async function genToken(): Promise<GenTokenResponse> {
  try {
    const instanceId = await DeviceInfo.getInstanceId();
    const requestData = genTokenRequestSchema.parse({ 
      device_id: instanceId 
    });
    
    const response = await apiClient
      .extend({
        timeout: 30000,
      })
      .post("auth/login", {
        json: requestData,
      })
      .json<unknown>();
      
    return genTokenResponseSchema.parse(response);
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
}
