import { apiClient } from "../client/ky-instance";
import {
  searchTrackRequestSchema,
  searchTrackResponseSchema,
  type SearchTrackResponse,
} from "./zod-schema";

export async function searchTrack(
  token: string,
  track: string,
  artist: string,
  theme: string,
  accent: boolean
): Promise<SearchTrackResponse> {
  const requestData = searchTrackRequestSchema.parse({
    track_name: track,
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
              request.headers.append("Authorization", `Bearer ${token}`);
            },
          ],
        },
      })
      .post("generate_track_poster", {
        json: requestData,
      })
      .json<unknown>();

    return searchTrackResponseSchema.parse(response);
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorJson = await error.response.json();
      throw new Error(errorJson.message);
    } else if (__DEV__) {
      throw error;
    } else throw "Please try again";
  }
}
