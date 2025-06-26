import AnimatedHeader from "@/components/ui-custom/animated-header";
import AnimatedHistoryItem from "@/components/ui-custom/animated-history-item";
import Background from "@/components/ui-custom/background";
import { SearchHistory, searchHistoryTable } from "@/db/schema";
import useDatabase from "@/hooks/useDatabase";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { SectionList, SectionListData, Text, View } from "react-native";

export default function SearchHistoryView() {
  const { db } = useDatabase();
  const [trackHistory, setTrackHistory] = useState<SearchHistory[]>([]);
  const [albumHistory, setAlbumHistory] = useState<SearchHistory[]>([]);

  const getSearchHistory = React.useCallback(async () => {
    const searchHistory = await db.select().from(searchHistoryTable);
    setTrackHistory(
      searchHistory
        .filter((item) => item.searchType === "Track")
        .sort(
          (a, b) =>
            b.createdAt.getMilliseconds() - a.createdAt.getMilliseconds()
        )
        .reverse()
    );
    setAlbumHistory(
      searchHistory
        .filter((item) => item.searchType === "Album")
        .sort(
          (a, b) =>
            b.createdAt.getMilliseconds() - a.createdAt.getMilliseconds()
        )
        .reverse()
    );
  }, [db]);

  useEffect(() => {
    getSearchHistory();
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
        await db.delete(searchHistoryTable).where(eq(searchHistoryTable.id, item.id));
        getSearchHistory();
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
    return (
      <View className="h-full w-full items-center justify-center">
        <Text className="text-foreground text-center">
          No search history found
        </Text>
      </View>
    );
  }, []);

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
