import { apiClient } from "../client/ky-instance";

export async function getPoster(
  token: string | null,
  posterUrl: string
): Promise<Blob> {
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
    .get(posterUrl);

  if (!response.ok)
    return Promise.reject(
      new Error(`Failed to fetch poster: ${response.status}`)
    );

  const blob = await response.blob();
  return blob;
}
