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
import { useFocusEffect } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, View } from "react-native";

const PRELOAD_ITEMS = 10;

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
  const {
    syncToSupabase,
    syncFromSupabase,
    supabaseLoginCheck,
    deleteFromSupabase,
  } = useSupabase();
  const [currentTab, setCurrentTab] = useState("albums");
  const [refreshingAlbums, setRefreshingAlbums] = useState(false);
  const [refreshingTracks, setRefreshingTracks] = useState(false);

  // Albums
  const [albumHistory, setAlbumHistory] = useState<SearchHistory[]>([]);
  const albumPointerRef = useRef<number>(0);
  const isLoadingAlbumsRef = useRef<boolean>(false);
  const hasMoreAlbumsRef = useRef<boolean>(true);
  const albumLengthRef = useRef<number>(0);

  // Tracks
  const [trackHistory, setTrackHistory] = useState<SearchHistory[]>([]);
  const trackPointerRef = useRef<number>(0);
  const isLoadingTracksRef = useRef<boolean>(false);
  const hasMoreTracksRef = useRef<boolean>(true);
  const trackLengthRef = useRef<number>(0);

  interface DataLoaderProps {
    reset?: boolean;
  }

  const incrementallyLoadAlbums = useCallback(
    async ({ reset = false }: DataLoaderProps) => {
      try {
        if (reset) {
          albumPointerRef.current = 0;
          hasMoreAlbumsRef.current = true;
          isLoadingAlbumsRef.current = false;
        }

        if (isLoadingAlbumsRef.current || !hasMoreAlbumsRef.current) return;

        isLoadingAlbumsRef.current = true;
        const baseWhere = eq(searchHistoryTable.searchType, "Album");

        const paginatedData = await db
          .select()
          .from(searchHistoryTable)
          .where(
            albumPointerRef.current > 0
              ? and(
                  baseWhere,
                  lt(searchHistoryTable.id, albumPointerRef.current),
                )
              : baseWhere,
          )
          .orderBy(desc(searchHistoryTable.id))
          .limit(PRELOAD_ITEMS);

        if (paginatedData.length === 0) {
          hasMoreAlbumsRef.current = false;
          isLoadingAlbumsRef.current = false;
          return;
        }

        albumPointerRef.current = paginatedData[paginatedData.length - 1].id;
        if (reset) {
          setAlbumHistory(paginatedData);
        } else {
          setAlbumHistory((prevHistory) => [...prevHistory, ...paginatedData]);
        }
        isLoadingAlbumsRef.current = false;
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
                pointer: albumPointerRef.current,
                loadedLength: albumLengthRef.current,
              },
            },
          },
        });
      }
    },
    [db],
  );

  const incrementallyLoadTracks = useCallback(
    async ({ reset = false }: DataLoaderProps) => {
      try {
        if (reset) {
          trackPointerRef.current = 0;
          hasMoreTracksRef.current = true;
          isLoadingTracksRef.current = false;
        }

        if (isLoadingTracksRef.current || !hasMoreTracksRef.current) return;

        isLoadingTracksRef.current = true;
        const baseWhere = eq(searchHistoryTable.searchType, "Track");

        const paginatedData = await db
          .select()
          .from(searchHistoryTable)
          .where(
            trackPointerRef.current > 0
              ? and(
                  baseWhere,
                  lt(searchHistoryTable.id, trackPointerRef.current),
                )
              : baseWhere,
          )
          .orderBy(desc(searchHistoryTable.id))
          .limit(PRELOAD_ITEMS);

        if (paginatedData.length === 0) {
          hasMoreTracksRef.current = false;
          isLoadingTracksRef.current = false;
          return;
        }

        trackPointerRef.current = paginatedData[paginatedData.length - 1].id;
        if (reset) {
          setTrackHistory(paginatedData);
        } else {
          setTrackHistory((prevHistory) => [...prevHistory, ...paginatedData]);
        }
        isLoadingTracksRef.current = false;
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
                pointer: trackPointerRef.current,
                loadedLength: trackLengthRef.current,
              },
            },
          },
        });
      }
    },
    [db],
  );

  const refreshAlbums = useCallback(async () => {
    if (refreshingAlbums) return;
    setRefreshingAlbums(true);
    try {
      const isLoggedIn = await supabaseLoginCheck();
      if (isLoggedIn) {
        await syncFromSupabase();
        await syncToSupabase();
      }
      await incrementallyLoadAlbums({ reset: true });
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
      if (isLoggedIn) {
        await syncFromSupabase();
        await syncToSupabase();
      }
      await incrementallyLoadTracks({ reset: true });
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
      if (isLoggedIn) {
        await syncFromSupabase();
        await syncToSupabase();
      }
      await Promise.all([
        incrementallyLoadAlbums({ reset: true }),
        incrementallyLoadTracks({ reset: true }),
      ]);
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
    supabaseLoginCheck,
    syncFromSupabase,
    syncToSupabase,
  ]);

  const initialLoad = async () => {
    Sentry.addBreadcrumb({
      message: "SearchHistoryView mounted",
      category: "ui",
      level: "info",
    });
    await Promise.all([
      incrementallyLoadAlbums({ reset: true }),
      incrementallyLoadTracks({ reset: true }),
    ]);
    syncHistory();
  };

  useEffect(() => {
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      initialLoad();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    albumLengthRef.current = albumHistory.length;
    trackLengthRef.current = trackHistory.length;
  }, [albumHistory, trackHistory]);

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

          const isLoggedIn = await supabaseLoginCheck();
          if (isLoggedIn) {
            await deleteFromSupabase(item.id);
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
    [currentTab, db, deleteFromSupabase, supabaseLoginCheck],
  );

  const ListEmptyComponent = React.useCallback(() => {
    return (
      <View className="h-full w-full items-start justify-center">
        <Text className="text-foreground text-center w-full font-ui-italic">
          {`No search history found.\nTry creating a poster first!`}
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
    <Background disableSafeArea className={"pt-safe px-0"}>
      <AnimatedHeader
        title="Search History 📜"
        description="Tracks and albums you couldn't get enough of"
        containerClassName={"px-5"}
      />
      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="flex-1 px-2"
      >
        <TabsContent value="albums" className="flex-1">
          {albumHistory.length === 0 ? (
            <ListEmptyComponent />
          ) : (
            <FlashList
              masonry
              numColumns={2}
              data={albumHistory}
              keyExtractor={(item) => item.id.toString()}
              onEndReached={() => incrementallyLoadAlbums({})}
              onEndReachedThreshold={0.7}
              contentContainerClassName={"mx-0 pb-[70] pt-4"}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              fadingEdgeLength={80}
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
          )}
        </TabsContent>
        <TabsContent value="tracks" className="flex-1">
          {trackHistory.length === 0 ? (
            <ListEmptyComponent />
          ) : (
            <FlashList
              masonry
              numColumns={2}
              data={trackHistory}
              keyExtractor={(item) => item.id.toString()}
              onEndReached={() => incrementallyLoadTracks({})}
              onEndReachedThreshold={0.7}
              contentContainerClassName={"mx-0 pb-[70] pt-4"}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              fadingEdgeLength={80}
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
          )}
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
