import { apiClient } from "../client/ky-instance";
import { searchPosterResponse } from "./types";

export async function searchAlbum(
  token: string,
  album: string,
  artist: string
): Promise<string> {
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
    .post("generate_album_poster", {
      json: {
        album_name: album,
        artist_name: artist,
        theme: "Dark",
        indexing: true,
        accent: false,
      },
    })
    .json<searchPosterResponse>();

  return response.url;
}
