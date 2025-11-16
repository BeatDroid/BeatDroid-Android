import type {
  SearchAlbumRequest,
  SearchAlbumResponse,
} from "@/api/search-album/zod-schema";
import type {
  SearchTrackRequest,
  SearchTrackResponse,
} from "@/api/search-track/zod-schema";
import { type NewSearchHistory, searchHistoryTable } from "@/db/schema";
import * as Sentry from "@sentry/react-native";
import { useCallback } from "react";
import useDatabase from "./useDatabase";
import useSupabase from "./useSupabase";

export function useSearchHistory() {
  const { db } = useDatabase();
  const { syncToSupabase } = useSupabase();

  const saveSearchToHistory = useCallback(
    async (
      responseData: SearchAlbumResponse | SearchTrackResponse,
      variables: SearchAlbumRequest | SearchTrackRequest,
      searchType: "Track" | "Album",
    ) => {
      if (!responseData.name || !responseData.artist_name) {
        console.error("Invalid response data: missing required fields");
        Sentry.captureMessage(
          "Failed to save search to database: missing required fields",
          {
            level: "error",
            tags: {
              operation: "saveSearchToHistory",
              validation: "failed",
              searchType,
            },
          },
        );
        return;
      }

      const hasThumbhash = "thumb_hash" in responseData;

      const insertData: NewSearchHistory = {
        searchType,
        searchParam: responseData.name,
        artistName: responseData.artist_name,
        theme: variables.theme,
        accentLine: variables.accent,
        blurhash: hasThumbhash ? responseData.thumb_hash : "",
        createdAt: new Date(),
      };

      try {
        await db.insert(searchHistoryTable).values(insertData);
        await syncToSupabase();

        Sentry.addBreadcrumb({
          type: "debug",
          category: "Database insert",
          level: "info",
          message: `Saved ${searchType} search to history`,
          data: {
            searchParam: insertData.searchParam,
            artistName: insertData.artistName,
          },
        });
      } catch (error) {
        console.error("Error saving to database:", error);
        Sentry.captureException(error, {
          tags: {
            operation: "saveSearchToHistory",
            searchType: searchType.toLowerCase(),
          },
          contexts: {
            database: {
              operation: "insert",
              table: "search_history",
              hasValidData: true,
            },
          },
        });
      }
    },
    [db, syncToSupabase],
  );

  return {
    saveSearchToHistory,
  };
}
