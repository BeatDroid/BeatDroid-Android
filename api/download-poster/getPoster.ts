import { apiClient } from "../client/ky-instance";
import {
  getPosterRequestSchema,
  getPosterResponseSchema,
  type GetPosterResponse,
} from "./zod-schema";

export async function getPoster(
  token: string | null,
  posterPath: string
): Promise<GetPosterResponse> {
  const requestData = getPosterRequestSchema.parse({
    filename: posterPath,
  });
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
      json: requestData,
    })
    .json<unknown>();

  return getPosterResponseSchema.parse(response);
}
