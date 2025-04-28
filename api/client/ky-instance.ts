import ky from "ky";

const prefixUrl = process.env.EXPO_PUBLIC_BASE_URL || "";

export const apiClient = ky.create({
  prefixUrl: prefixUrl + "/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
