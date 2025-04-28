import { useAuth } from "@/contexts/auth-context";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { searchAlbum } from "./searchAlbum";

interface UseAlbumSearchApiParams {
  onSuccess: (data: string) => void;
  onError: (error: unknown) => void;
  onMutate?: (variables: { album: string; artist: string }) => void;
}

export type UseAlbumSearchApi = ReturnType<
  typeof useCustomMutation<string, { album: string; artist: string }>
>;

export function useAlbumSearchApi({
  onSuccess,
  onError,
  onMutate = () => {},
}: UseAlbumSearchApiParams): UseAlbumSearchApi {
  const { token } = useAuth();
  const searchAlbumApi = useCustomMutation({
    mutationKey: ["usePosterDownApi"],
    mutationFn: async ({ album, artist }: { album: string; artist: string }) =>
      searchAlbum(token!, album, artist),
    onSuccess,
    onError,
    onMutate,
  });
  return searchAlbumApi;
}
