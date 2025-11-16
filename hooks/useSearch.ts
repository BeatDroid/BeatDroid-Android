import { useAlbumSearchApi } from "@/api/search-album/useAlbumSearchApi";
import type {
  SearchAlbumRequest,
  SearchAlbumResponse,
} from "@/api/search-album/zod-schema";
import { useTrackSearchApi } from "@/api/search-track/useTrackSearchApi";
import type {
  SearchTrackRequest,
  SearchTrackResponse,
} from "@/api/search-track/zod-schema";
import { router } from "expo-router";
import { useCallback } from "react";
import { toast } from "sonner-native";
import { useSearchHistory } from "./useSearchHistory";

type SearchConfig = {
  onMutate?: (variables: SearchAlbumRequest | SearchTrackRequest) => void;
  onSuccessExtra?: (
    data: SearchAlbumResponse | SearchTrackResponse,
    variables: SearchAlbumRequest | SearchTrackRequest,
  ) => void;
};

export function useSearch(config?: SearchConfig) {
  const { saveSearchToHistory } = useSearchHistory();

  const handleError = useCallback(
    (error: unknown, searchType: "track" | "album") => {
      console.error(`${searchType} search error:`, error);

      let errorMessage = "Unknown error";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = String((error as { message?: unknown }).message);
      }

      const displayMessage =
        errorMessage === ""
          ? "An error occurred. Please try again."
          : errorMessage;

      toast.error("Search failed", {
        description: displayMessage,
      });
    },
    [],
  );

  const handleTrackSuccess = useCallback(
    async (data: SearchTrackResponse, variables: SearchTrackRequest) => {
      config?.onSuccessExtra?.(data, variables);

      if ("lyrics" in data) {
        router.navigate({
          pathname: "/lyric-selection",
          params: {
            name: data.name,
            artistName: data.artist_name,
            lyrics: data.lyrics,
            songName: variables.song_name,
            theme: variables.theme,
            accentLine: variables.accent.toString(),
          },
        });
      } else if ("poster_url" in data) {
        await saveSearchToHistory(data, variables, "Track");

        router.navigate({
          pathname: "/poster-view",
          params: {
            posterPath: data.poster_url,
            blurhash: data.thumb_hash,
            searchParam: data.name,
            artistName: data.artist_name,
            theme: variables.theme,
            accentLine: variables.accent.toString(),
          },
        });
      }
    },
    [saveSearchToHistory, config],
  );

  const handleAlbumSuccess = useCallback(
    async (data: SearchAlbumResponse, variables: SearchAlbumRequest) => {
      config?.onSuccessExtra?.(data, variables);

      await saveSearchToHistory(data, variables, "Album");

      router.navigate({
        pathname: "/poster-view",
        params: {
          posterPath: data.poster_url,
          blurhash: data.thumb_hash,
          searchParam: data.name,
          artistName: data.artist_name,
          theme: variables.theme,
          accentLine: variables.accent.toString(),
        },
      });
    },
    [saveSearchToHistory, config],
  );

  const trackSearch = useTrackSearchApi({
    onMutate: config?.onMutate,
    onSuccess: handleTrackSuccess,
    onError: (error) => handleError(error, "track"),
  });

  const albumSearch = useAlbumSearchApi({
    onMutate: config?.onMutate,
    onSuccess: handleAlbumSuccess,
    onError: (error) => handleError(error, "album"),
  });

  return {
    trackSearch,
    albumSearch,
    isSearching: trackSearch.isPending || albumSearch.isPending,
  };
}
