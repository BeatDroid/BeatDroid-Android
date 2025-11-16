import ky from "ky";

const prefixUrl = process.env.EXPO_PUBLIC_BASE_URL || "";

export const apiClient = ky.create({
  prefixUrl,
  headers: { "Content-Type": "application/json" },
});
