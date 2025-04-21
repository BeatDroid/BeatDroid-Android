import { apiClient } from "../client/ky-instance";
import { genTokenResponse } from "./types";

const username = process.env.EXPO_PUBLIC_USERNAME || "";
const password = process.env.EXPO_PUBLIC_PASSWORD || "";

export async function genToken(): Promise<genTokenResponse> {
  const response = await apiClient
    .post("auth/login", {
      json: { username, password },
    })
    .json<genTokenResponse>();
  return response;
}
