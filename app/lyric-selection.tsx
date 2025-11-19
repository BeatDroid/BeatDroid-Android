import type { Theme } from "@/api/common/theme-schema";
import AnimatedHeader from "@/components/ui-custom/animated-header";
import AnimatedLyricInfoCard from "@/components/ui-custom/animated-lyric-info-card";
import Background from "@/components/ui-custom/background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useSearch } from "@/hooks/useSearch";
import { parseLyrics } from "@/utils/text-utls";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

const ExpoFeather = cssInterop(Feather, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

type Lyric = { id: number; text: string };
type BlockRange = string; // Format: "start-end" e.g., "0-3"

const LyricSelection = () => {
  const { name, artistName, lyrics, songName, theme, accentLine } =
    useLocalSearchParams<{
      name: string;
      artistName: string;
      lyrics: string;
      songName: string;
      theme: string;
      accentLine: string;
    }>();
  const [lyricList, setLyricList] = useState<Lyric[]>();
  const [hasCustomLyrics, setHasCustomLyrics] = useState(false);
  const [customLyrics, setCustomLyrics] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<BlockRange | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const { trackSearch } = useSearch();

  useEffect(() => {
    const parsedLyrics = parseLyrics(lyrics);
    setLyricList(parsedLyrics);
  }, [lyrics]);

  const nonEmptyLyrics = useMemo(() => {
    return lyricList?.filter((l) => l.text !== "") ?? [];
  }, [lyricList]);

  // Get the selected lyric IDs as a Set for O(1) lookup
  const selectedLyricIds = useMemo(() => {
    if (!selectedBlock) return new Set<number>();
    const [start, end] = selectedBlock.split("-").map(Number);
    const ids = new Set<number>();
    for (let i = start; i <= end; i++) {
      ids.add(i);
    }
    return ids;
  }, [selectedBlock]);

  // Handle line selection - selects 4 consecutive lines
  const handleLineSelect = useCallback(
    (index: number) => {
      const totalLines = nonEmptyLyrics.length;

      // Calculate the start index for the 4-line block
      let startIndex = index;

      // If selecting near the end, adjust to get last 4 lines
      if (index > totalLines - 4) {
        startIndex = Math.max(0, totalLines - 4);
      }

      const selectedLyrics = nonEmptyLyrics.slice(startIndex, startIndex + 4);

      if (selectedLyrics.length > 0) {
        const startId = selectedLyrics[0].id;
        const endId = selectedLyrics[selectedLyrics.length - 1].id;
        const newRange = `${startId}-${endId}`;

        // Toggle selection if clicking on already selected range
        const isDeselecting = selectedBlock === newRange;
        setSelectedBlock(isDeselecting ? null : newRange);
        setSelectedIndices(
          isDeselecting
            ? null
            : {
                start: startIndex + 1,
                end: startIndex + selectedLyrics.length,
              },
        );
      }
    },
    [nonEmptyLyrics, selectedBlock],
  );

  const renderLine = useCallback(
    ({ item, index }: { item: Lyric; index: number }) => {
      const isSelected = selectedLyricIds.has(item.id);

      // Determine if this is the first or last in the selected block
      let isFirstSelected = false;
      let isLastSelected = false;

      if (isSelected && selectedBlock) {
        const [startId, endId] = selectedBlock.split("-").map(Number);
        isFirstSelected = item.id === startId;
        isLastSelected = item.id === endId;
      }

      return (
        <LyricLine
          lyric={item}
          index={index}
          isSelected={isSelected}
          isFirstSelected={isFirstSelected}
          isLastSelected={isLastSelected}
          onPress={() => handleLineSelect(index)}
        />
      );
    },
    [selectedLyricIds, selectedBlock, handleLineSelect],
  );

  const keyExtractor = useCallback((item: Lyric) => item.id.toString(), []);

  const handleGeneratePoster = useCallback(() => {
    if ((!selectedBlock || selectedLyricIds.size === 0) && !hasCustomLyrics) {
      return;
    }

    const payload =
      selectedBlock && selectedLyricIds.size > 0
        ? { lyric_lines: selectedBlock }
        : hasCustomLyrics && customLyrics.trim().length > 0
          ? { custom_lyrics: customLyrics.trim() }
          : undefined;

    if (!payload) return;

    trackSearch.mutate({
      song_name: songName.trim(),
      artist_name: artistName.trim(),
      theme: theme as Theme,
      accent: accentLine === "true",
      ...payload,
    });
  }, [
    selectedBlock,
    selectedLyricIds,
    trackSearch,
    songName,
    artistName,
    theme,
    accentLine,
    hasCustomLyrics,
    customLyrics,
  ]);

  const handleCustomLyricsSet = useCallback(
    ({ lyrics }: { lyrics: string }) => {
      setCustomLyrics(lyrics);
      if (lyrics && lyrics.trim() !== "") {
        setHasCustomLyrics(true);
      } else {
        setHasCustomLyrics(false);
      }
    },
    [],
  );

  return (
    <Background>
      <View className="flex-1">
        <AnimatedHeader
          title="Lyric Selection 🎤"
          description="Tap any line to select a 4-line block"
          containerClassName={"pb-4"}
        />
        <Card
          className={
            "flex-1 rounded-3xl border-2 border-primary/20 bg-secondary p-0 mb-4"
          }
        >
          <Card
            className={
              "py-3 mx-2 mt-2 bg-background flex-row items-center px-5 mb-[-20]"
            }
          >
            <ExpoFeather name={"music"} size={20} className={"text-primary"} />
            <Text
              numberOfLines={1}
              className="text-primary text-lg font-ui-bold pr-8"
            >
              {name} by {artistName}
            </Text>
          </Card>
          {lyricList && lyricList.length > 4 ? (
            <FlashList
              data={nonEmptyLyrics}
              renderItem={renderLine}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              fadingEdgeLength={100}
              contentContainerClassName={"pb-[200] px-2"}
            />
          ) : (
            <NoLyricComponent lyricList={lyricList} />
          )}
        </Card>

        {/* Floating Action Bar */}
        <AnimatedLyricInfoCard
          disabled={
            (!selectedBlock && !hasCustomLyrics) || trackSearch.isPending
          }
          selectedIndices={selectedIndices}
          onPress={handleGeneratePoster}
          onCustomLyricsSet={handleCustomLyricsSet}
          buttonLabel={
            trackSearch.isPending
              ? "Generating..."
              : !selectedBlock && !hasCustomLyrics
                ? "Select a line to continue"
                : "Generate Poster"
          }
        />
      </View>
    </Background>
  );
};

const NoLyricComponent = React.memo(function NoLyricComponent({
  lyricList,
}: {
  lyricList: Lyric[] | undefined;
}) {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-center text-muted-foreground text-sm font-ui-regular">
        {lyricList && lyricList.length > 1 && lyricList.length < 4
          ? `Not enough lines to select.\nTry adding some custom lyrics instead!`
          : "No lyrics available"}
      </Text>
    </View>
  );
});

NoLyricComponent.displayName = "NoLyricComponent";

// Individual Lyric Line Component
interface LyricLineProps {
  lyric: Lyric;
  index: number;
  isSelected: boolean;
  isFirstSelected: boolean;
  isLastSelected: boolean;
  onPress: () => void;
}

const LyricLine = React.memo(function LyricLine({
  lyric,
  index,
  isSelected,
  isFirstSelected,
  isLastSelected,
  onPress,
}: LyricLineProps) {
  if (isSelected) {
    return (
      <Button
        onPress={onPress}
        variant="ghost"
        size="sm"
        className={`
           bg-primary/20 border-l-2 border-primary rounded-none pr-8
          ${isFirstSelected ? "rounded-t-2xl border-t-2 border-r-2 mt-4" : "border-t-0"}
          ${isLastSelected ? "rounded-b-2xl border-b-2 border-r-2 mb-4" : ""}
          ${!isFirstSelected && !isLastSelected ? "border-r-2" : ""}
        `}
      >
        <View className="flex-1 flex-row items-center">
          <Text className="text-primary text-xs font-ui-regular mr-4">
            {index + 1}
          </Text>
          <Text className="font-ui-thin text-primary" numberOfLines={1}>
            {lyric.text.trim()}
          </Text>
        </View>
      </Button>
    );
  }

  return (
    <Button onPress={onPress} variant="ghost" className={"mr-2"}>
      <View className="flex-1 flex-row items-center">
        <Text className="text-primary text-xs font-ui-regular mr-4">
          {index + 1}
        </Text>
        <Text
          className="font-ui-thin text-foreground/90 text-center"
          numberOfLines={1}
        >
          {lyric.text.trim()}
        </Text>
      </View>
    </Button>
  );
});

export default LyricSelection;
