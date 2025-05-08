import { apiClient } from "../client/ky-instance";
import { searchPosterResponse } from "./types";

export async function searchAlbum(
  token: string,
  album: string,
  artist: string,
  theme: string,
  accent: boolean
): Promise<searchPosterResponse> {
  const response = await apiClient
    .extend({
      timeout: 60000,
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.append("Authorization", `Bearer ${token}`);
          },
        ],
      },
    })
    .post("generate_album_poster", {
      json: {
        album_name: album,
        artist_name: artist,
        theme,
        indexing: true,
        accent,
      },
    })
    .json<searchPosterResponse>();

  return response;
}
