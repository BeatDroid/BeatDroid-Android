import type { Theme } from "@/api/common/theme-schema";
import { useTrackSearchApi } from "@/api/search-track/useTrackSearchApi";
import type {
  SearchTrackRequest,
  SearchTrackResponse,
} from "@/api/search-track/zod-schema";
import AnimatedHeader from "@/components/ui-custom/animated-header";
import Background from "@/components/ui-custom/background";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { parseLyrics } from "@/utils/text-utls";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { toast } from "sonner-native";

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
  const [selectedBlock, setSelectedBlock] = useState<BlockRange | null>(null);

  useEffect(() => {
    setLyricList(parseLyrics(lyrics));
  }, [lyrics]);

  // Get only non-empty lyrics for block selection
  const nonEmptyLyrics = useMemo(() => {
    return lyricList?.filter((l) => l.text !== "") ?? [];
  }, [lyricList]);

  // Create 4-line blocks from non-empty lyrics
  const lyricBlocks = useMemo(() => {
    const blocks: { range: BlockRange; lyrics: Lyric[] }[] = [];
    for (let i = 0; i < nonEmptyLyrics.length; i += 4) {
      const blockLyrics = nonEmptyLyrics.slice(i, i + 4);
      if (blockLyrics.length > 0) {
        // Use actual lyric IDs from parsed lyrics to indicate real line numbers
        const startId = blockLyrics[0].id;
        const endId = blockLyrics[blockLyrics.length - 1].id;
        blocks.push({
          range: `${startId}-${endId}`,
          lyrics: blockLyrics,
        });
      }
    }
    return blocks;
  }, [nonEmptyLyrics]);

  // Toggle block selection
  const toggleBlock = useCallback((range: BlockRange) => {
    setSelectedBlock((prev) => (prev === range ? null : range));
  }, []);

  // Check if a block is selected
  const isBlockSelected = useCallback(
    (range: BlockRange) => selectedBlock === range,
    [selectedBlock],
  );

  // Render function for block-based FlatList
  const renderBlock = useCallback(
    ({ item }: { item: { range: BlockRange; lyrics: Lyric[] } }) => {
      return (
        <LyricBlock
          range={item.range}
          lyrics={item.lyrics}
          isSelected={isBlockSelected(item.range)}
          onPress={toggleBlock}
        />
      );
    },
    [isBlockSelected, toggleBlock],
  );

  const keyExtractor = useCallback(
    (item: { range: BlockRange; lyrics: Lyric[] }) => item.range,
    [],
  );

  // API handlers
  const onSuccess = (
    data: SearchTrackResponse,
    variables: SearchTrackRequest,
  ) => {
    // This time we should get the poster response
    if ("poster_url" in data) {
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
    } else {
      // Unexpected: got lyrics again instead of poster
      toast.error("Unexpected response", {
        description: "Please try again",
      });
    }
  };

  const onError = (error: unknown) => {
    console.log("Error: ", error);
    let errorMessage = "Unknown error";
    if (error && typeof error === "object" && "message" in error) {
      errorMessage = String((error as { message?: unknown }).message);
    }
    const displayMessage =
      errorMessage === ""
        ? "An error occurred. Please try again."
        : errorMessage;
    toast.error("Failed to generate poster", {
      description: displayMessage,
    });
  };

  const searchTrackApi = useTrackSearchApi({
    onSuccess,
    onError,
  });

  const handleGeneratePoster = useCallback(() => {
    if (!selectedBlock) return;

    // Call the same API with lyric_lines parameter
    searchTrackApi.mutate({
      song_name: songName,
      artist_name: artistName,
      theme: theme as Theme,
      accent: accentLine === "true",
      lyric_lines: selectedBlock, // Pass selected lyrics range
    });
  }, [selectedBlock, songName, artistName, theme, accentLine, searchTrackApi]);

  return (
    <Background>
      <View className="flex-1">
        <AnimatedHeader
          title="Lyric Selection 🎤"
          description="Select the lyrics you want to include in your poster"
          containerClassName={"pb-2"}
        />
        <Text className="text-muted-foreground text-sm font-ui-bold mb-6">
          {name} by {artistName}
        </Text>
        <FlashList
          data={lyricBlocks}
          renderItem={renderBlock}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          fadingEdgeLength={20}
          contentContainerClassName={"pb-40 px-2"}
        />

        {/* Floating Action Bar */}
        <View className="absolute bottom-3 left-0 right-0 rounded-3xl bg-black/95 border-2 border-primary/20">
          <View className="pt-6 pb-6 px-6">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-muted-foreground text-xs font-ui-regular">
                  Selected Block
                </Text>
                <Text className="text-foreground text-2xl font-ui-bold">
                  {selectedBlock ? `Lines ${selectedBlock}` : "No selection"}
                </Text>
              </View>
              <View className="bg-primary/20 px-4 py-2 rounded-full">
                <Text className="text-primary text-sm font-ui-semibold">
                  {selectedBlock ? "✓ Ready" : "Select block"}
                </Text>
              </View>
            </View>

            <Button
              className="w-full rounded-xl"
              disabled={!selectedBlock || searchTrackApi.isPending}
              onPress={handleGeneratePoster}
            >
              <Text className="font-ui-semibold text-base">
                {searchTrackApi.isPending
                  ? "Generating..."
                  : !selectedBlock
                    ? "Select a 4-line block"
                    : "Generate Poster"}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Background>
  );
};

// Lyric Block Component - Displays 4 lines as a single selectable block
interface LyricBlockProps {
  range: BlockRange;
  lyrics: Lyric[];
  isSelected: boolean;
  onPress: (range: BlockRange) => void;
}

const LyricBlock = React.memo(function LyricBlock({
  range,
  lyrics,
  isSelected,
  onPress,
}: LyricBlockProps) {
  const handlePress = useCallback(() => {
    onPress(range);
  }, [onPress, range]);

  return (
    <Pressable onPress={handlePress} className="mb-4">
      <View
        className={`
          p-5 rounded-2xl border-2
          ${
            isSelected
              ? "bg-primary/20 border-primary"
              : "bg-card/80 border-border/50"
          }
        `}
      >
        {/* Block header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View
              className={`
                w-6 h-6 rounded-full mr-3 border-2 items-center justify-center
                ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "bg-muted/40 border-muted-foreground/60"
                }
              `}
            >
              {isSelected && (
                <Text className="text-primary-foreground text-xs font-ui-bold">
                  ✓
                </Text>
              )}
            </View>
            <Text className="text-muted-foreground text-xs font-ui-regular">
              Lines {range}
            </Text>
          </View>
          <Text
            className={`text-xs font-ui-semibold ${isSelected ? "text-primary" : "text-muted-foreground"}`}
          >
            {lyrics.length} {lyrics.length === 1 ? "line" : "lines"}
          </Text>
        </View>

        {/* Lyrics content */}
        <View className="space-y-2">
          {lyrics.map((lyric, index) => (
            <Text
              key={lyric.id}
              className={`
                text-base leading-6 font-ui-thin
                ${isSelected ? "text-primary" : "text-foreground/90"}
                ${index < lyrics.length - 1 ? "mb-2" : ""}
              `}
            >
              {lyric.text}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
});

export default LyricSelection;
