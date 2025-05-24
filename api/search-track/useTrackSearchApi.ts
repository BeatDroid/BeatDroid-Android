import { useAuth } from "@/contexts/auth-context";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { searchTrack } from "./searchTrack";
import { searchTrackParameter, searchTrackResponse } from "./types";

interface UseTrackSearchApiParams {
  onSuccess: (data: searchTrackResponse) => void;
  onError: (error: unknown) => void;
  onMutate?: (variables: searchTrackParameter) => void;
}

export type UseTrackSearchApi = ReturnType<
  typeof useCustomMutation<searchTrackResponse, searchTrackParameter>
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
    }: searchTrackParameter) =>
      searchTrack(token!, track_name, artist_name, theme, accent),
    onSuccess,
    onError,
    onMutate,
  });
  return searchTrackApi;
}
