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
      const { track_name, artist_name, theme, accent } = params;
      return searchTrack(null, track_name, artist_name, theme, accent);
    },
    onSuccess,
    onError,
    onMutate,
  });
}
