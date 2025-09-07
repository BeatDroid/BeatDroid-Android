import AnimatedHeader from "@/components/ui-custom/animated-header";
import AnimatedHistoryItem from "@/components/ui-custom/animated-history-item";
import Background from "@/components/ui-custom/background";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { SearchHistory, searchHistoryTable } from "@/db/schema";
import useDatabase from "@/hooks/useDatabase";
import useSupabase from "@/hooks/useSupabase";
import * as Sentry from "@sentry/react-native";
import { FlashList } from "@shopify/flash-list";
import { and, desc, eq } from "drizzle-orm";
import { lt } from "drizzle-orm/sql/expressions/conditions";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, View } from "react-native";
import { cssInterop } from "nativewind";

const preloadItems = 10;

type RefreshControlProps = React.ComponentProps<typeof RefreshControl> & {
  className?: string;
  style?: any;
};

function ThemedRefreshControl(props: RefreshControlProps) {
  const { style, progressBackgroundColor, tintColor, colors, ...rest } = props;
  const flatStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : style || {};
  const bg = (flatStyle?.backgroundColor as string | undefined) ?? undefined;
  const fg = (flatStyle?.color as string | undefined) ?? undefined;

  return (
    <RefreshControl
      {...rest}
      progressBackgroundColor={bg ?? progressBackgroundColor}
      tintColor={fg ?? tintColor}
      colors={fg ? [fg] : colors}
    />
  );
}

const TwRefreshControl = cssInterop(ThemedRefreshControl, {
  className: {
    target: "style",
  },
});

export default function SearchHistoryView() {
  const { db } = useDatabase();
  const { syncToSupabase, syncFromSupabase, supabaseLoginCheck } =
    useSupabase();
  const [currentTab, setCurrentTab] = useState("albums");
  const [refreshingAlbums, setRefreshingAlbums] = useState(false);
  const [refreshingTracks, setRefreshingTracks] = useState(false);

  // Albums
  const [albumHistory, setAlbumHistory] = useState<SearchHistory[]>([]);
  const [albumPointer, setAlbumPointer] = useState<number>(0);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);

  // Tracks
  const [trackHistory, setTrackHistory] = useState<SearchHistory[]>([]);
  const [trackPointer, setTrackPointer] = useState<number>(0);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);

  const incrementallyLoadAlbums = useCallback(async () => {
    try {
      if (isLoadingAlbums || !hasMoreAlbums) return;

      setIsLoadingAlbums(true);
      // For descending order, use lt(pointer) to fetch older items
      const baseWhere = eq(searchHistoryTable.searchType, "Album");

      const paginatedData = await db
        .select()
        .from(searchHistoryTable)
        .where(
          albumPointer > 0
            ? and(baseWhere, lt(searchHistoryTable.id, albumPointer))
            : baseWhere,
        )
        .orderBy(desc(searchHistoryTable.id))
        .limit(preloadItems);

      if (paginatedData.length === 0) {
        setHasMoreAlbums(false);
        setIsLoadingAlbums(false);
        return;
      }

      // With desc order, the next pointer is the smallest id from this page
      const nextPointer = paginatedData[paginatedData.length - 1].id;
      setAlbumPointer(nextPointer);
      setAlbumHistory((prevHistory) => [...prevHistory, ...paginatedData]);
      setIsLoadingAlbums(false);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          operation: "incrementallyLoadAlbums",
          component: "SearchHistoryView",
        },
        contexts: {
          database: {
            operation: "incremental_album_load",
            table: "searchHistoryTable",
            where: {
              searchType: "Album",
              pointer: albumPointer,
              loadedLength: albumHistory.length,
            },
          },
        },
      });
    }
  }, [albumHistory.length, albumPointer, db, hasMoreAlbums, isLoadingAlbums]);

  const incrementallyLoadTracks = useCallback(async () => {
    try {
      if (isLoadingTracks || !hasMoreTracks) return;

      setIsLoadingTracks(true);
      // For descending order, use lt(pointer) to fetch older items
      const baseWhere = eq(searchHistoryTable.searchType, "Track");

      const paginatedData = await db
        .select()
        .from(searchHistoryTable)
        .where(
          trackPointer > 0
            ? and(baseWhere, lt(searchHistoryTable.id, trackPointer))
            : baseWhere,
        )
        .orderBy(desc(searchHistoryTable.id))
        .limit(preloadItems);

      if (paginatedData.length === 0) {
        setHasMoreTracks(false);
        setIsLoadingTracks(false);
        return;
      }

      // With desc order, the next pointer is the smallest id from this page
      const nextPointer = paginatedData[paginatedData.length - 1].id;
      setTrackPointer(nextPointer);
      setTrackHistory((prevHistory) => [...prevHistory, ...paginatedData]);
      setIsLoadingTracks(false);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          operation: "incrementallyLoadTracks",
          component: "SearchHistoryView",
        },
        contexts: {
          database: {
            operation: "incremental_track_load",
            table: "searchHistoryTable",
            where: {
              searchType: "Track",
              pointer: trackPointer,
              loadedLength: trackHistory.length,
            },
          },
        },
      });
    }
  }, [db, hasMoreTracks, isLoadingTracks, trackHistory.length, trackPointer]);

  const resetPointers = useCallback(() => {
    setAlbumPointer(0);
    setTrackPointer(0);
    setHasMoreAlbums(true);
    setHasMoreTracks(true);
    setIsLoadingAlbums(false);
    setIsLoadingTracks(false);
    setAlbumHistory([]);
    setTrackHistory([]);
  }, []);

  const refreshAlbums = useCallback(async () => {
    if (refreshingAlbums) return;
    setRefreshingAlbums(true);
    try {
      const isLoggedIn = await supabaseLoginCheck();
      setAlbumPointer(0);
      setHasMoreAlbums(true);
      setIsLoadingAlbums(false);
      setAlbumHistory([]);
      if (isLoggedIn) {
        await syncFromSupabase();
        await syncToSupabase();
      }
      await new Promise((r) => setTimeout(r, 0));
      await incrementallyLoadAlbums();
    } catch (error) {
      Sentry.captureException(error, {
        tags: { operation: "refreshAlbums", component: "SearchHistoryView" },
      });
    } finally {
      setRefreshingAlbums(false);
    }
  }, [
    incrementallyLoadAlbums,
    refreshingAlbums,
    supabaseLoginCheck,
    syncFromSupabase,
    syncToSupabase,
  ]);

  const refreshTracks = useCallback(async () => {
    if (refreshingTracks) return;
    setRefreshingTracks(true);
    try {
      const isLoggedIn = await supabaseLoginCheck();
      setTrackPointer(0);
      setHasMoreTracks(true);
      setIsLoadingTracks(false);
      setTrackHistory([]);
      if (isLoggedIn) {
        await syncFromSupabase();
        await syncToSupabase();
      }
      await new Promise((r) => setTimeout(r, 0));
      await incrementallyLoadTracks();
    } catch (error) {
      Sentry.captureException(error, {
        tags: { operation: "refreshTracks", component: "SearchHistoryView" },
      });
    } finally {
      setRefreshingTracks(false);
    }
  }, [
    incrementallyLoadTracks,
    refreshingTracks,
    supabaseLoginCheck,
    syncFromSupabase,
    syncToSupabase,
  ]);

  const syncHistory = useCallback(async () => {
    setRefreshingAlbums(true);
    setRefreshingTracks(true);
    try {
      const isLoggedIn = await supabaseLoginCheck();
      resetPointers();
      if (isLoggedIn) {
        await syncFromSupabase();
        await syncToSupabase();
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
      await Promise.all([incrementallyLoadAlbums(), incrementallyLoadTracks()]);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { operation: "syncHistory", component: "SearchHistoryView" },
      });
    } finally {
      setRefreshingAlbums(false);
      setRefreshingTracks(false);
    }
  }, [
    incrementallyLoadAlbums,
    incrementallyLoadTracks,
    resetPointers,
    supabaseLoginCheck,
    syncFromSupabase,
    syncToSupabase,
  ]);

  useEffect(() => {
    Sentry.addBreadcrumb({
      message: "SearchHistoryView mounted",
      category: "ui",
      level: "info",
    });
    syncHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: SearchHistory }) => {
      const deleteSearchHistory = async (item: SearchHistory) => {
        const startTime = Date.now();

        try {
          await db
            .delete(searchHistoryTable)
            .where(eq(searchHistoryTable.id, item.id));
          if (currentTab === "albums") {
            setAlbumHistory((prevHistory) =>
              prevHistory.filter((historyItem) => historyItem.id !== item.id),
            );
          } else {
            setTrackHistory((prevHistory) =>
              prevHistory.filter((historyItem) => historyItem.id !== item.id),
            );
          }

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
    [currentTab, db],
  );

  const renderListEmptyComponent = React.useCallback(() => {
    return (
      <View className="h-full w-full items-center justify-center">
        <Text className="text-foreground text-center">
          No search history found
        </Text>
      </View>
    );
  }, []);

  // Track component render performance
  React.useEffect(() => {
    Sentry.addBreadcrumb({
      message: "SearchHistoryView rendered",
      category: "ui",
      level: "info",
      data: {
        // sectionsCount: sections.length,
        totalItems: trackHistory.length + albumHistory.length,
        trackItems: trackHistory.length,
        albumItems: albumHistory.length,
        renderTime: Date.now(),
      },
    });
  }, [trackHistory.length, albumHistory.length]);

  return (
    <Background className="px-0">
      <AnimatedHeader
        duration={500}
        offset={50}
        title="Search History 📜"
        description="Tracks and albums you couldn't get enough of"
      />
      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="flex-1 px-0"
      >
        <TabsContent value="albums" className="flex-1">
          <FlashList
            masonry
            numColumns={2}
            data={albumHistory}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={incrementallyLoadAlbums}
            onEndReachedThreshold={0.7}
            ListEmptyComponent={renderListEmptyComponent}
            contentContainerClassName={"mx-2 pb-[85]"}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            fadingEdgeLength={70}
            scrollEventThrottle={16}
            refreshing={refreshingAlbums}
            onRefresh={refreshAlbums}
            refreshControl={
              <TwRefreshControl
                className="bg-muted text-primary"
                refreshing={refreshingAlbums}
                onRefresh={refreshAlbums}
              />
            }
          />
        </TabsContent>
        <TabsContent value="tracks" className="flex-1">
          <FlashList
            masonry
            numColumns={2}
            data={trackHistory}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={incrementallyLoadTracks}
            onEndReachedThreshold={0.7}
            ListEmptyComponent={renderListEmptyComponent}
            contentContainerClassName={"mx-2 pb-[85]"}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            fadingEdgeLength={70}
            scrollEventThrottle={16}
            refreshing={refreshingTracks}
            onRefresh={refreshTracks}
            refreshControl={
              <TwRefreshControl
                className="bg-muted text-foreground"
                refreshing={refreshingTracks}
                onRefresh={refreshTracks}
              />
            }
          />
        </TabsContent>
        <TabsList className="absolute rounded-full bottom-5 w-[80%] self-center p-1 h-[7%]">
          <TabsTrigger className={"flex-1 h-full rounded-full"} value="albums">
            <Text>Albums</Text>
          </TabsTrigger>
          <TabsTrigger className={"flex-1 h-full rounded-full"} value="tracks">
            <Text>Tracks</Text>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </Background>
  );
}
