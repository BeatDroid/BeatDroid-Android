import type { Theme } from "@/api/common/theme-schema";
import { useAlbumSearchApi } from "@/api/search-album/useAlbumSearchApi";
import {
  SearchAlbumRequest,
  SearchAlbumResponse,
} from "@/api/search-album/zod-schema";
import { useTrackSearchApi } from "@/api/search-track/useTrackSearchApi";
import {
  SearchTrackRequest,
  SearchTrackResponse,
} from "@/api/search-track/zod-schema";
import AnimatedCard from "@/components/ui-custom/animated-card";
import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedHeader from "@/components/ui-custom/animated-header";
import type { AnimatedInputRef } from "@/components/ui-custom/animated-input";
import AnimatedInput from "@/components/ui-custom/animated-input";
import Background from "@/components/ui-custom/background";
import MiniPoster from "@/components/ui-custom/mini-poster";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useStartup } from "@/contexts/startup-context";
import { type NewSearchHistory, searchHistoryTable } from "@/db/schema";
import { useColorScheme } from "@/hooks/useColorScheme";
import useDatabase from "@/hooks/useDatabase";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import useSupabase from "@/hooks/useSupabase";
import { themes } from "@/lib/constants";
import { SearchType } from "@/lib/types";
import { notificationHaptic } from "@/utils/haptic-utils";
import { selectPoster } from "@/utils/poster-utils";
import { searchRegex } from "@/utils/text-utls";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Sentry from "@sentry/react-native";
import { router, useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ExpoMaterialIcons = cssInterop(MaterialIcons, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

const ExpoFontAwesome = cssInterop(FontAwesome, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

export default function Search() {
  const { dbSearchParam, dbArtistName, dbSearchType, dbTheme, dbAccentLine } =
    useLocalSearchParams<{
      dbSearchParam: string;
      dbArtistName: string;
      dbSearchType: string;
      dbTheme: string;
      dbAccentLine: string;
    }>();

  const { db } = useDatabase();
  const { syncToSupabase } = useSupabase();
  const { isLoading } = useStartup();
  const insets = useSafeAreaInsets();
  const isNarrow = useResponsiveLayout(400);
  const { isDarkColorScheme } = useColorScheme();
  const searchParamRef = useRef<AnimatedInputRef>(null);
  const artistNameRef = useRef<AnimatedInputRef>(null);
  const [searchType, setSearchType] = useState<SearchType>("Choose type");
  const [searchParam, setSearchParam] = useState<string | undefined>(undefined);
  const [artistName, setArtistName] = useState<string | undefined>(undefined);
  const [searchParamDefault, setSearchParamDefault] = useState<
    string | undefined
  >(undefined);
  const [artistNameDefault, setArtistNameDefault] = useState<
    string | undefined
  >(undefined);
  const [theme, setTheme] = useState<Theme>("Dark");
  const [accentLine, setAccentLine] = useState(false);
  const buttonVariant = isDarkColorScheme ? "outline" : "secondary";
  const buttonContainerHeight = useSharedValue(0);
  const statusChipHeight = useSharedValue(50);

  useEffect(() => {
    if (dbSearchParam) {
      setSearchParam(dbSearchParam);
    }
    if (dbArtistName) {
      setArtistName(dbArtistName);
    }
    if (dbSearchType) {
      setSearchType(dbSearchType as SearchType);
    }
    if (dbTheme) {
      setTheme(dbTheme as Theme);
    }
    if (dbAccentLine) {
      setAccentLine(dbAccentLine === "true");
    }
    router.setParams({
      dbSearchParam: undefined,
      dbArtistName: undefined,
      dbSearchType: undefined,
      dbTheme: undefined,
      dbAccentLine: undefined,
    });
  }, [dbSearchParam, dbArtistName, dbSearchType, dbTheme, dbAccentLine]);

  useEffect(() => {
    if (!isLoading) {
      statusChipHeight.value = withTiming(0, {
        duration: 500,
        easing: Easing.inOut(Easing.sin),
      });
    } else {
      statusChipHeight.value = withTiming(50, {
        duration: 500,
        easing: Easing.inOut(Easing.sin),
      });
    }
  }, [isLoading, statusChipHeight]);

  useEffect(() => {
    const selector = selectPoster(searchType);
    setSearchParamDefault(selector.searchParam);
    setArtistNameDefault(selector.artistName);
    buttonContainerHeight.value = withTiming(75, { duration: 300 });
    if (searchType === "Choose type") {
      buttonContainerHeight.value = withTiming(0, { duration: 300 });
    }
  }, [buttonContainerHeight, searchType]);

  const onMutate = (variables: SearchAlbumRequest | SearchTrackRequest) => {
    const isTrackSearch = "song_name" in variables;
    const searchParam = isTrackSearch
      ? variables.song_name
      : variables.album_name;

    Sentry.setContext("Search Input", {
      searchType,
      searchParam,
      artistName: variables.artist_name,
      theme: variables.theme,
      accentLine: variables.accent,
    });
  };

  const onSuccess = (
    data: SearchAlbumResponse | SearchTrackResponse,
    variables: SearchAlbumRequest | SearchTrackRequest,
  ) => {
    saveToDb(data, variables);

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
  };

  const onError = (error: unknown) => {
    console.log("Error: ", error);

    let errorMessage = "Unknown error";
    if (error && typeof error === "object" && "message" in error) {
      errorMessage = String((error as { message?: unknown }).message);
    }

    // Show error toast with fallback message
    const displayMessage =
      errorMessage === ""
        ? "An error occurred. Please try again."
        : errorMessage;
    toast.error("Search failed", {
      description: displayMessage,
    });
  };

  const searchAlbumApi = useAlbumSearchApi({
    onMutate,
    onSuccess,
    onError,
  });

  const searchTrackApi = useTrackSearchApi({
    onMutate,
    onSuccess,
    onError,
  });

  const search = () => {
    const sanitizedSearchParam = searchParam?.trim();
    setSearchParam(
      sanitizedSearchParam && sanitizedSearchParam.length > 0
        ? sanitizedSearchParam
        : undefined,
    );
    const sanitizedArtistName = artistName?.trim();
    setArtistName(
      sanitizedArtistName && sanitizedArtistName.length > 0
        ? sanitizedArtistName
        : undefined,
    );
    artistNameRef.current?.blur();
    searchParamRef.current?.blur();
    let sanityCheckFailed = false;
    if (!sanitizedSearchParam) {
      notificationHaptic();
      searchParamRef.current?.clear();
      searchParamRef.current?.shake();
      toast.error("Missing search parameter", {
        description: "Please enter a search parameter",
      });
      sanityCheckFailed = true;
    }
    if (!sanitizedArtistName) {
      notificationHaptic();
      artistNameRef.current?.clear();
      artistNameRef.current?.shake();
      toast.error("Missing artist name", {
        description: "Please enter an artist name",
      });
      sanityCheckFailed = true;
    }
    if (sanityCheckFailed) {
      return;
    }
    const isSearchParamValid =
      searchRegex.test(sanitizedSearchParam!) &&
      sanitizedSearchParam!.length > 0 &&
      sanitizedSearchParam!.length <= 100;
    const isArtistNameValid =
      searchRegex.test(sanitizedArtistName!) &&
      sanitizedArtistName!.length > 0 &&
      sanitizedArtistName!.length <= 100;
    if (!isSearchParamValid) {
      notificationHaptic();
      searchParamRef.current?.shake();
      toast.error("Invalid search parameter", {
        description: "Please enter a valid search parameter",
      });
      sanityCheckFailed = true;
    }
    if (!isArtistNameValid) {
      notificationHaptic();
      artistNameRef.current?.shake();
      toast.error("Invalid artist name", {
        description: "Please enter a valid artist name",
      });
      sanityCheckFailed = true;
    }
    if (sanityCheckFailed) {
      return;
    }
    searchParamRef.current?.clearError();
    artistNameRef.current?.clearError();
    if (searchType === "Track") {
      searchTrackApi.mutate({
        song_name: sanitizedSearchParam!,
        artist_name: sanitizedArtistName!,
        theme,
        accent: accentLine,
        lyric_lines: "5-9",
      });
    } else {
      searchAlbumApi.mutate({
        album_name: sanitizedSearchParam!,
        artist_name: sanitizedArtistName!,
        theme,
        accent: accentLine,
      });
    }
  };

  const saveToDb = async (
    responseData: SearchAlbumResponse | SearchTrackResponse,
    passedVariables: SearchAlbumRequest | SearchTrackRequest,
  ) => {
    // Validate required fields before attempting database insertion
    if (!responseData.name || !responseData.artist_name) {
      console.error("Invalid response data: missing required fields");
      Sentry.captureMessage(
        "Failed to save search to database: missing required fields",
        {
          level: "error",
          tags: {
            operation: "saveToDb",
            validation: "failed",
          },
        },
      );
      return;
    }

    // Determine search type based on request variables
    const isTrackSearch = "song_name" in passedVariables;

    const insertData: NewSearchHistory = {
      searchType: isTrackSearch ? "Track" : "Album",
      searchParam: responseData.name,
      artistName: responseData.artist_name,
      theme: passedVariables.theme,
      accentLine: passedVariables.accent,
      blurhash: responseData.thumb_hash,
      createdAt: new Date(),
    };

    try {
      await db.insert(searchHistoryTable).values(insertData);
      await syncToSupabase();
    } catch (error) {
      console.error("Error saving to database:", error);
      Sentry.captureException(error, {
        tags: {
          operation: "saveToDb",
          searchType: isTrackSearch ? "track" : "album",
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
  };

  const buttonContainerStyle = useAnimatedStyle(() => {
    return {
      height: buttonContainerHeight.value,
    };
  });

  const statusChipContainerStyle = useAnimatedStyle(() => {
    return {
      height: statusChipHeight.value,
      width: `${interpolate(statusChipHeight.value, [0, 50], [0, 100])}%`,
      opacity: interpolate(statusChipHeight.value, [30, 50], [0, 1]),
    };
  });

  return (
    <Background disableSafeArea className={"pt-safe px-0"}>
      <KeyboardAwareScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-4"
        bottomOffset={30}
        fadingEdgeLength={100}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedHeader
          title="Search 🌟"
          description="Search for your favorite music or albums"
          containerClassName={"px-2 pb-6"}
        />
        <Animated.View
          style={statusChipContainerStyle}
          className={"overflow-hidden"}
        >
          <View className="flex-row items-center justify-center bg-transparent border border-accent px-4 py-2 w-1/2 rounded-full">
            <Text className={"text-md mb-1"}>Fetching token</Text>
            <ActivityIndicator
              size={"small"}
              className={"ml-4 text-foreground aspect-square w-auto h-[70%]"}
            />
          </View>
        </Animated.View>
        <AnimatedCard index={0} className="dark:border-transparent">
          <CardHeader className={"items-center flex-row justify-center"}>
            <Label className={"font-ui-bold"}>What's on your mind today?</Label>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={buttonVariant}>
                  <Text className="font-ui-bold">{searchType}</Text>
                  <ExpoMaterialIcons
                    name="keyboard-arrow-down"
                    size={24}
                    className={"text-foreground ml-2"}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 native:w-72">
                <Animated.View entering={FadeIn.duration(300)}>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onPress={() => setSearchType("Track")}>
                      <Text>Track</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onPress={() => setSearchType("Album")}>
                      <Text>Album</Text>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </Animated.View>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </AnimatedCard>
        <AnimatedCard index={1} className="mt-4 dark:border-transparent">
          <CardHeader className={"items-center flex-row justify-center"}>
            <Label className={"font-ui-bold"}>What are you looking for?</Label>
          </CardHeader>
          <CardContent>
            <AnimatedInput
              ref={searchParamRef}
              label={
                searchType === "Choose type"
                  ? "Choose a search type first"
                  : `${searchType} name`
              }
              editable={
                searchType !== "Choose type" &&
                !searchAlbumApi.isPending &&
                !searchTrackApi.isPending
              }
              placeholder={`Eg. ${searchParamDefault}`}
              value={searchParam}
              onChangeText={setSearchParam}
              textInputClassName={"bg-secondary dark:bg-background/70"}
            />
            <AnimatedInput
              ref={artistNameRef}
              label={
                searchType === "Choose type"
                  ? "Decide what you want before searching"
                  : `Artist name`
              }
              editable={
                searchType !== "Choose type" &&
                !searchAlbumApi.isPending &&
                !searchTrackApi.isPending
              }
              placeholder={`Eg. ${artistNameDefault}`}
              value={artistName}
              onChangeText={setArtistName}
              textInputClassName={"bg-secondary dark:bg-background/70"}
              className="mt-4"
            />
          </CardContent>
        </AnimatedCard>
        <View className="flex-row w-full h-[250]">
          <View className="flex-1">
            <AnimatedCard
              index={2}
              className="mt-4 dark:border-transparent flex-1"
            >
              <CardHeader className={"items-center flex-row justify-center"}>
                <Label className={"font-ui-bold"}>Colour theme</Label>
              </CardHeader>
              <CardContent className="flex-1 content-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={buttonVariant}>
                      <Text className="font-ui-bold">{theme}</Text>
                      <ExpoMaterialIcons
                        name="keyboard-arrow-down"
                        size={24}
                        className={"text-foreground"}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 native:w-72"
                    insets={{ bottom: insets.bottom + 20 }}
                  >
                    <Animated.View entering={FadeIn.duration(300)}>
                      {Object.keys(themes).map((theme) => (
                        <DropdownMenuItem
                          key={theme}
                          onPress={() => setTheme(theme as Theme)}
                        >
                          <Text>{theme}</Text>
                        </DropdownMenuItem>
                      ))}
                    </Animated.View>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </AnimatedCard>
            <AnimatedCard
              index={3}
              className="mt-4 dark:border-transparent flex-1"
            >
              <CardHeader className={"items-center flex-row justify-center"}>
                <Label className={"font-ui-bold"}>Accent Line</Label>
              </CardHeader>
              <CardContent className={"items-center flex-row justify-center"}>
                <ExpoFontAwesome
                  name="circle-o"
                  className={"text-foreground mr-3"}
                  size={20}
                />
                <Switch
                  checked={accentLine}
                  onCheckedChange={setAccentLine}
                  nativeID="accent-line"
                />
                <ExpoFontAwesome
                  name="dot-circle-o"
                  className={"text-foreground ml-3"}
                  size={20}
                />
              </CardContent>
            </AnimatedCard>
          </View>
          <View className="w-4" />
          <AnimatedCard
            index={4}
            className="mt-4 w-1/2 border-0 items-center justify-center fg-background shadow-md shadow-black"
          >
            <MiniPoster theme={theme} accentEnabled={accentLine} />
          </AnimatedCard>
        </View>
      </KeyboardAwareScrollView>
      <Animated.View
        style={buttonContainerStyle}
        className={"overflow-hidden px-5 mb-3"}
      >
        <AnimatedConfirmButton
          title={"Create Poster"}
          icon={<ExpoMaterialIcons name="auto-awesome" size={20} />}
          loading={
            searchAlbumApi.isPending || searchTrackApi.isPending || isLoading
          }
          onPress={search}
          disabled={searchType === "Choose type"}
          buttonClassName={"rounded-full"}
        />
      </Animated.View>
    </Background>
  );
}
