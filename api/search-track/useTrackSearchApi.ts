import { useAuth } from "@/contexts/auth-context";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { searchTrack } from "./searchTrack";
import { SearchTrackRequest, SearchTrackResponse } from "./zod-schema";

interface UseTrackSearchApiParams {
  onSuccess: (data: SearchTrackResponse) => void;
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
  const { token } = useAuth();
  const searchTrackApi = useCustomMutation({
    mutationKey: ["useTrackSearchApi"],
    mutationFn: async ({
      track_name = "",
      artist_name = "",
      theme = "Dark",
      accent = false,
    }: SearchTrackRequest) =>
      searchTrack(token!, track_name, artist_name, theme, accent),
    onSuccess,
    onError,
    onMutate,
  });
  return searchTrackApi;
}
