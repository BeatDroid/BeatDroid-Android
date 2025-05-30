import { useAuth } from "@/contexts/auth-context";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { searchAlbum } from "./searchAlbum";
import type { SearchAlbumRequest, SearchAlbumResponse } from "./zod-schema";

interface UseAlbumSearchApiParams {
  onSuccess: (data: SearchAlbumResponse) => void;
  onError: (error: unknown) => void;
  onMutate?: (variables: SearchAlbumRequest) => void;
}

export type UseAlbumSearchApi = ReturnType<
  typeof useCustomMutation<SearchAlbumResponse, SearchAlbumRequest>
>;

export function useAlbumSearchApi({
  onSuccess,
  onError,
  onMutate = () => {},
}: UseAlbumSearchApiParams): UseAlbumSearchApi {
  const { token } = useAuth();
  const searchAlbumApi = useCustomMutation({
    mutationKey: ["useAlbumSearchApi"],
    mutationFn: async (params: SearchAlbumRequest) => {
      const { album_name, artist_name, theme, accent } = params;
      return searchAlbum(token!, album_name, artist_name, theme, accent);
    },
    onSuccess,
    onError,
    onMutate,
  });
  return searchAlbumApi;
}
