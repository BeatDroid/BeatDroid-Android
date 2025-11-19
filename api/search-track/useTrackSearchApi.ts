import { useCustomMutation } from "@/hooks/useCustomMutation";
import { searchTrack } from "./searchTrack";
import type { SearchTrackRequest, SearchTrackResponse } from "./zod-schema";

interface UseTrackSearchApiParams {
  onSuccess: (data: SearchTrackResponse, variables: SearchTrackRequest) => void;
  onError: (error: unknown) => void;
  onMutate?: (variables: SearchTrackRequest) => void;
}

export type UseTrackSearchApi = ReturnType<
  typeof useCustomMutation<SearchTrackResponse, SearchTrackRequest>
>;

export function useTrackSearchApi({
  onSuccess,
  onError,
  onMutate = () => {},
}: UseTrackSearchApiParams): UseTrackSearchApi {
  return useCustomMutation({
    mutationKey: ["useTrackSearchApi"],
    mutationFn: async (params: SearchTrackRequest) => {
      const {
        song_name,
        artist_name,
        theme,
        accent,
        lyric_lines,
        custom_lyrics,
      } = params;
      return searchTrack(
        song_name,
        artist_name,
        theme,
        accent,
        lyric_lines,
        custom_lyrics,
      );
    },
    onSuccess,
    onError,
    onMutate,
  });
}
