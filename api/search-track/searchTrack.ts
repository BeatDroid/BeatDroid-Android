import { apiClient } from "../client/ky-instance";
import { searchTrackResponse } from "./types";

export async function searchTrack(
  token: string,
  track: string,
  artist: string,
  theme: string,
  accent: boolean
): Promise<searchTrackResponse> {
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
    .post("generate_track_poster", {
      json: {
        track_name: track,
        artist_name: artist,
        theme,
        indexing: true,
        accent,
      },
    })
    .json<searchTrackResponse>();

  return response;
}
