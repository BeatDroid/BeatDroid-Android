import type { Theme } from "@/api/common/theme-schema";
import { apiClient } from "../client/ky-instance";
import {
  searchTrackRequestSchema,
  type SearchTrackResponse,
  searchTrackResponseSchema,
} from "./zod-schema";

export async function searchTrack(
  track: string,
  artist: string,
  theme: Theme,
  accent: boolean,
  lyric_lines?: string,
): Promise<SearchTrackResponse> {
  const requestData = searchTrackRequestSchema.parse({
    song_name: track,
    artist_name: artist,
    theme,
    accent,
    ...(lyric_lines !== undefined && { lyric_lines }),
  });

  try {
    const response = await apiClient
      .extend({
        timeout: 30000,
      })
      .post("api/v1/posters/track", {
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
