import AnimatedHeader from "@/components/ui-custom/animated-header";
import Background from "@/components/ui-custom/background";
import MiniPoster from "@/components/ui-custom/mini-poster";
import { Card, CardHeader } from "@/components/ui/card";
import { SearchHistory, searchHistoryTable } from "@/db/schema";
import useDatabase from "@/hooks/useDatabase";
import { ImageBackground } from "expo-image";
import React, { useEffect, useState } from "react";
import { SectionList, SectionListData, Text, View } from "react-native";

export default function SearchHistoryView() {
  const { db } = useDatabase();
  const [trackHistory, setTrackHistory] = useState<SearchHistory[]>([]);
  const [albumHistory, setAlbumHistory] = useState<SearchHistory[]>([]);

  useEffect(() => {
    const getSearchHistory = async () => {
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
    };
    getSearchHistory();
  }, [db]);

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
    ({ item }: { item: SearchHistory }) => (
      <Card className="mb-4 mx-4 border-0 rounded overflow-hidden">
        <ImageBackground
          source={{ blurhash: item.blurhash || "" }}
          className="flex-1"
        >
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-background opacity-40 dark:opacity-20" />
          <CardHeader className="flex-row justify-between items-center">
            <View className="flex-1 pr-5">
              <Text
                numberOfLines={1}
                className="text-foreground font-bold text-lg"
              >
                {item.searchParam}
              </Text>
              <Text numberOfLines={1} className="text-foreground text-sm">
                {item.artistName}
              </Text>
              <Text numberOfLines={1} className="text-foreground text-sm">
                {item.theme + (item.accentLine ? " with accent line" : "")}
              </Text>
              <Text numberOfLines={1} className="text-foreground text-sm">
                {item.createdAt.toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>
            </View>
            <View className="w-16 h-auto aspect-[7.3/10]">
              <MiniPoster
                microMode
                theme={item.theme}
                accentEnabled={item.accentLine}
                className="shadow-md"
              />
            </View>
          </CardHeader>
        </ImageBackground>
      </Card>
    ),
    []
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
