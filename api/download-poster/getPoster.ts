import { apiClient } from "../client/ky-instance";
import { getPosterResponse } from "./types";

export async function getPoster(
  token: string | null,
  posterPath: string
): Promise<getPosterResponse> {
  const response = await apiClient
    .extend({
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.append("Authorization", `Bearer ${token}`);
          },
        ],
      },
    })
    .post("get_poster", {
      json: {
        filename: posterPath,
      },
    })
    .json<getPosterResponse>();

  if (!response.image)
    return Promise.reject(
      new Error(`Failed to fetch poster: ${response.image}`)
    );

  return response;
}
