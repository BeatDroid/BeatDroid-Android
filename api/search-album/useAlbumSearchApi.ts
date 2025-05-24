import { useAuth } from "@/contexts/auth-context";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { searchAlbum } from "./searchAlbum";
import { searchAlbumParameter, searchAlbumResponse } from "./types";

interface UseAlbumSearchApiParams {
  onSuccess: (data: searchAlbumResponse) => void;
  onError: (error: unknown) => void;
  onMutate?: (variables: searchAlbumParameter) => void;
}

export type UseAlbumSearchApi = ReturnType<
  typeof useCustomMutation<searchAlbumResponse, searchAlbumParameter>
>;

export function useAlbumSearchApi({
  onSuccess,
  onError,
  onMutate = () => {},
}: UseAlbumSearchApiParams): UseAlbumSearchApi {
  const { token } = useAuth();
  const searchAlbumApi = useCustomMutation({
    mutationKey: ["useAlbumSearchApi"],
    mutationFn: async ({
      album_name = "",
      artist_name = "",
      theme = "Dark",
      accent = false,
    }: searchAlbumParameter) =>
      searchAlbum(token!, album_name, artist_name, theme, accent),
    onSuccess,
    onError,
    onMutate,
  });
  return searchAlbumApi;
}
