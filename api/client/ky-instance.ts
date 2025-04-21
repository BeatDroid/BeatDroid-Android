import ky from "ky";

export const apiClient = ky.create({
  prefixUrl: "https://beatdroiddev.raspiripper.cloud" + "/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
