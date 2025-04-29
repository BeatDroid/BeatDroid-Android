import { useAuth } from "@/contexts/auth-context";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { searchAlbum } from "./searchAlbum";
import { searchPosterParameter } from "./types";

interface UseAlbumSearchApiParams {
  onSuccess: (data: string) => void;
  onError: (error: unknown) => void;
  onMutate?: (variables: searchPosterParameter) => void;
}

export type UseAlbumSearchApi = ReturnType<
  typeof useCustomMutation<string, searchPosterParameter>
>;

export function useAlbumSearchApi({
  onSuccess,
  onError,
  onMutate = () => {},
}: UseAlbumSearchApiParams): UseAlbumSearchApi {
  const { token } = useAuth();
  const searchAlbumApi = useCustomMutation({
    mutationKey: ["usePosterDownApi"],
    mutationFn: async ({
      album_name = "",
      artist_name = "",
      theme = "Dark",
      accent = false,
    }: searchPosterParameter) =>
      searchAlbum(token!, album_name, artist_name, theme, accent),
    onSuccess,
    onError,
    onMutate,
  });
  return searchAlbumApi;
}
