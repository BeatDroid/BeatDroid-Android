import { apiClient } from "../client/ky-instance";

export async function getPoster(token: string | null): Promise<Blob> {
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
    .get("get_poster/albums/abbey_road_(remastered)_by_the_beatles_644.png");

  if (!response.ok)
    return Promise.reject(
      new Error(`Failed to fetch poster: ${response.status}`)
    );

  const blob = await response.blob();
  return blob;
}
