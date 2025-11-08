import { apiClient } from "../client/ky-instance";
import {
  searchAlbumRequestSchema,
  type SearchAlbumResponse,
  searchAlbumResponseSchema,
} from "./zod-schema";

export async function searchAlbum(
  token: string | null,
  album: string,
  artist: string,
  theme: string,
  accent: boolean,
): Promise<SearchAlbumResponse> {
  const requestData = searchAlbumRequestSchema.parse({
    album_name: album,
    artist_name: artist,
    theme,
    accent,
    indexing: true,
  });

  try {
    const response = await apiClient
      .extend({
        timeout: 30000,
        hooks: {
          beforeRequest: [
            (request) => {
              if (token) {
                request.headers.append("Authorization", `Bearer ${token}`);
              }
            },
          ],
        },
      })
      .post("api/v1/posters/album", { json: requestData })
      .json<unknown>();

    return searchAlbumResponseSchema.parse(response);
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorJson = await error.response.json();
      throw new Error(errorJson.message);
    } else if (__DEV__) {
      throw error;
    } else throw "Please try again";
  }
}
