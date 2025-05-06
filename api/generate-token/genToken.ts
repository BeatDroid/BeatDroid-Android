import { apiClient } from "../client/ky-instance";
import { genTokenResponse } from "./types";
import DeviceInfo from "react-native-device-info";

export async function genToken(): Promise<genTokenResponse> {
  try {
    const instanceId = await DeviceInfo.getInstanceId();
    const response = await apiClient
      .post("auth/login", {
        json: { device_id: instanceId },
      })
      .json<genTokenResponse>();
    return response;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}
