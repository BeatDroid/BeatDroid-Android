import AnimatedHeader from "@/components/ui-custom/animated-header";
import AnimatedHistoryItem from "@/components/ui-custom/animated-history-item";
import Background from "@/components/ui-custom/background";
import { SearchHistory, searchHistoryTable } from "@/db/schema";
import useDatabase from "@/hooks/useDatabase";
import * as Sentry from "@sentry/react-native";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { SectionList, SectionListData, Text, View } from "react-native";

export default function SearchHistoryView() {
  const { db } = useDatabase();
  const [trackHistory, setTrackHistory] = useState<SearchHistory[]>([]);
  const [albumHistory, setAlbumHistory] = useState<SearchHistory[]>([]);

  const getSearchHistory = React.useCallback(async () => {
    const startTime = Date.now();

    try {
      const searchHistory = await db.select().from(searchHistoryTable);

      const tracks = searchHistory
        .filter((item) => item.searchType === "Track")
        .sort(
          (a, b) =>
            b.createdAt.getMilliseconds() - a.createdAt.getMilliseconds()
        )
        .reverse();

      const albums = searchHistory
        .filter((item) => item.searchType === "Album")
        .sort(
          (a, b) =>
            b.createdAt.getMilliseconds() - a.createdAt.getMilliseconds()
        )
        .reverse();

      setTrackHistory(tracks);
      setAlbumHistory(albums);

      const queryTime = Date.now() - startTime;

      // Log performance metrics
      Sentry.addBreadcrumb({
        message: "Search history loaded",
        category: "data",
        level: "info",
        data: {
          totalItems: searchHistory.length,
          trackCount: tracks.length,
          albumCount: albums.length,
          combinedCount: tracks.length + albums.length,
          dbQueryTime: queryTime,
        },
      });

      // Set custom tags for filtering in Sentry
      Sentry.setTag("search_history_loaded", true);
      Sentry.setContext("search_history_stats", {
        tracks: tracks.length,
        albums: albums.length,
        total: searchHistory.length,
        combined: tracks.length + albums.length,
        queryDuration: queryTime,
      });

      // Track performance metric
      Sentry.metrics.timing("search_history.query_time", queryTime);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          operation: "getSearchHistory",
          component: "SearchHistoryView",
        },
        contexts: {
          database: {
            operation: "select_search_history",
            table: "searchHistoryTable",
          },
        },
      });

      throw error;
    }
  }, [db]);

  useEffect(() => {
    Sentry.addBreadcrumb({
      message: "SearchHistoryView mounted",
      category: "ui",
      level: "info",
    });

    getSearchHistory().catch((error) => {
      Sentry.captureException(error, {
        tags: {
          lifecycle: "useEffect",
          component: "SearchHistoryView",
        },
      });
    });
  }, [db, getSearchHistory]);

  const sections: SectionListData<SearchHistory>[] = [
    ...(albumHistory.length > 0
      ? [
          {
            title: "Albums",
            data: albumHistory,
          },
        ]
      : []),
    ...(trackHistory.length > 0
      ? [
          {
            title: "Tracks",
            data: trackHistory,
          },
        ]
      : []),
  ];

  const renderSectionHeader = React.useCallback(
    ({ section }: { section: SectionListData<SearchHistory> }) => (
      <View className="bg-accent p-4 mb-8 mt-3 items-center">
        <Text className="text-xl font-bold text-foreground">
          {section.title}
        </Text>
      </View>
    ),
    []
  );

  const renderItem = React.useCallback(
    ({ item }: { item: SearchHistory }) => {
      const deleteSearchHistory = async (item: SearchHistory) => {
        const startTime = Date.now();

        try {
          await db
            .delete(searchHistoryTable)
            .where(eq(searchHistoryTable.id, item.id));
          await getSearchHistory();

          const deleteTime = Date.now() - startTime;

          // Log successful deletion
          Sentry.addBreadcrumb({
            message: "Search history item deleted",
            category: "user_action",
            level: "info",
            data: {
              itemId: item.id,
              searchType: item.searchType,
              searchParam: item.searchParam,
              deletedAt: new Date().toISOString(),
              deleteTime,
            },
          });

          // Track delete performance
          Sentry.metrics.timing("search_history.delete_time", deleteTime);
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              operation: "deleteSearchHistory",
              component: "SearchHistoryView",
            },
            contexts: {
              database: {
                operation: "delete_search_history",
                table: "searchHistoryTable",
                itemId: item.id,
              },
              user_action: {
                action: "delete_history_item",
                itemType: item.searchType,
              },
            },
          });

          throw error;
        }
      };

      return (
        <AnimatedHistoryItem
          item={item}
          onDelete={async () => deleteSearchHistory(item)}
        />
      );
    },
    [db, getSearchHistory]
  );

  const renderListEmptyComponent = React.useCallback(() => {
    // Log when empty state is shown
    Sentry.addBreadcrumb({
      message: "Search history empty state displayed",
      category: "ui",
      level: "info",
      data: {
        trackCount: trackHistory.length,
        albumCount: albumHistory.length,
        timestamp: new Date().toISOString(),
      },
    });

    return (
      <View className="h-full w-full items-center justify-center">
        <Text className="text-foreground text-center">
          No search history found
        </Text>
      </View>
    );
  }, [trackHistory.length, albumHistory.length]);

  // Track component render performance
  React.useEffect(() => {
    Sentry.addBreadcrumb({
      message: "SearchHistoryView rendered",
      category: "ui",
      level: "info",
      data: {
        sectionsCount: sections.length,
        totalItems: trackHistory.length + albumHistory.length,
        trackItems: trackHistory.length,
        albumItems: albumHistory.length,
        renderTime: Date.now(),
      },
    });
  }, [sections.length, trackHistory.length, albumHistory.length]);

  return (
    <Background className="px-0">
      <AnimatedHeader
        duration={500}
        offset={50}
        title="Search History 📜"
        description="Tracks and albums you couldn't get enough of"
      />
      <SectionList
        sections={sections}
        keyExtractor={(item: SearchHistory) => item.id.toString()}
        ListEmptyComponent={renderListEmptyComponent}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        fadingEdgeLength={100}
        showsVerticalScrollIndicator={false}
      />
    </Background>
  );
}
