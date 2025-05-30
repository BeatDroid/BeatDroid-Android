import { apiClient } from "../client/ky-instance";
import {
  searchAlbumRequestSchema,
  searchAlbumResponseSchema,
  type SearchAlbumResponse,
} from "./zod-schema";

export async function searchAlbum(
  token: string,
  album: string,
  artist: string,
  theme: string,
  accent: boolean
): Promise<SearchAlbumResponse> {
  // Validate input parameters
  const requestData = searchAlbumRequestSchema.parse({
    album_name: album,
    artist_name: artist,
    theme,
    accent,
    indexing: true,
  });

  const response = await apiClient
    .extend({
      timeout: 30000,
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.append("Authorization", `Bearer ${token}`);
          },
        ],
      },
    })
    .post("generate_album_poster", { json: requestData })
    .json<unknown>();

  // Validate and parse the response
  return searchAlbumResponseSchema.parse(response);
}
