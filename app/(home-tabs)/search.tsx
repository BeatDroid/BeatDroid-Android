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
import { useAuth } from "@/contexts/auth-context";
import { type NewSearchHistory, searchHistoryTable } from "@/db/schema";
import useDatabase from "@/hooks/useDatabase";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import useSupabase from "@/hooks/useSupabase";
import { themes } from "@/lib/constants";
import { SearchType, ThemeTypes } from "@/lib/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";
import { notificationHaptic, selectionHaptic } from "@/utils/haptic-utils";
import { selectPoster } from "@/utils/poster-utils";
import { searchRegex } from "@/utils/text-utls";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { router, useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
  FadeIn,
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
  const { isTokenSet } = useAuth();
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
  const [theme, setTheme] = useState<ThemeTypes>("Dark");
  const [accentLine, setAccentLine] = useState(false);
  const buttonVariant = isDarkColorScheme ? "outline" : "secondary";
  const buttonContainerHeight = useSharedValue(0);

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
      setTheme(dbTheme as ThemeTypes);
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
    const selector = selectPoster(searchType);
    setSearchParamDefault(selector.searchParam);
    setArtistNameDefault(selector.artistName);
    buttonContainerHeight.value = withTiming(75, { duration: 300 });
    if (searchType === "Choose type") {
      buttonContainerHeight.value = withTiming(0, { duration: 300 });
    }
  }, [buttonContainerHeight, searchType]);

  const onMutate = (variables: SearchAlbumRequest | SearchTrackRequest) => {
    const searchParam =
      "track_name" in variables ? variables.track_name : variables.album_name;

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
        posterPath: data.data?.filePath,
        blurhash: data.data?.blurhash,
        searchParam:
          "trackName" in data.data!
            ? data.data!.trackName
            : data.data!.albumName,
        artistName: data.data!.artistName,
        theme: variables.theme,
        accentLine: variables.accent.toString(),
      },
    });
  };

  const onError = (error: unknown) => {
    console.log("Error: ", error);
    let description = "Unknown error";
    if (error && typeof error === "object" && "message" in error) {
      description = String((error as { message?: unknown }).message);
    }
    toast.error("Search failed", {
      description:
        description === ""
          ? "An error occurred. Please try again."
          : description,
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
        track_name: sanitizedSearchParam!,
        artist_name: sanitizedArtistName!,
        theme,
        accent: accentLine,
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
    const insertData: NewSearchHistory = {
      searchType: "albumName" in responseData.data! ? "Album" : "Track",
      searchParam:
        "trackName" in responseData.data!
          ? responseData.data!.trackName
          : responseData.data!.albumName,
      artistName: responseData.data!.artistName,
      theme: passedVariables.theme,
      accentLine: passedVariables.accent,
      blurhash: responseData.data!.blurhash,
      createdAt: new Date(),
    };

    await db.insert(searchHistoryTable).values(insertData);

    await syncToSupabase();
  };

  const buttonContainerStyle = useAnimatedStyle(() => {
    return {
      height: buttonContainerHeight.value,
    };
  });

  return (
    <Background disableSafeArea className={"pt-safe"}>
      <AnimatedHeader
        title="Search 🌟"
        description="Search for your favorite music or albums"
      />
      <KeyboardAwareScrollView
        className="flex-1 mt-6"
        bottomOffset={30}
        fadingEdgeLength={100}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedCard index={0} className="dark:border-transparent">
          <CardHeader className="flex-row justify-between items-center">
            <Label>Search Type</Label>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={buttonVariant}>
                  <Text className="font-ui-bold">{searchType}</Text>
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
          <CardHeader>
            <Label className="">What are you looking for?</Label>
          </CardHeader>
          <CardContent>
            <AnimatedInput
              ref={searchParamRef}
              label={
                searchType === "Choose type"
                  ? "Choose a search type first"
                  : `${searchType} name`
              }
              editable={searchType !== "Choose type"}
              placeholder={`Eg. ${searchParamDefault}`}
              value={searchParam}
              onChangeText={setSearchParam}
            />
            <AnimatedInput
              ref={artistNameRef}
              label={
                searchType === "Choose type"
                  ? "Decide what you want before searching"
                  : `Artist name`
              }
              editable={searchType !== "Choose type"}
              placeholder={`Eg. ${artistNameDefault}`}
              value={artistName}
              onChangeText={setArtistName}
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
              <CardHeader>
                <Label>Colour theme</Label>
              </CardHeader>
              <CardContent className="flex-1 content-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={buttonVariant}>
                      <Text className="font-ui-bold">{theme}</Text>
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
                          onPress={() => setTheme(theme as ThemeTypes)}
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
              <CardHeader>
                <Label>{isNarrow ? "Accent Line" : "Decor"}</Label>
              </CardHeader>
              <CardContent>
                <View
                  className={cn(
                    "items-center",
                    isNarrow ? "flex-col" : "flex-row",
                  )}
                >
                  <Switch
                    checked={accentLine}
                    onCheckedChange={setAccentLine}
                    nativeID="accent-line"
                  />
                  {!isNarrow && (
                    <Label
                      className="ml-6 flex-1"
                      nativeID="accent-line"
                      onPress={() => {
                        setAccentLine((prev) => !prev);
                        selectionHaptic();
                      }}
                    >
                      Accent line
                    </Label>
                  )}
                </View>
              </CardContent>
            </AnimatedCard>
          </View>
          <View className="w-4" />
          <AnimatedCard
            index={4}
            className="mt-4 border-0 items-center justify-center bg-transparent shadow-none"
          >
            <MiniPoster theme={theme} accentEnabled={accentLine} />
          </AnimatedCard>
        </View>
      </KeyboardAwareScrollView>
      <Animated.View style={buttonContainerStyle} className={"overflow-hidden"}>
        <AnimatedConfirmButton
          title={"Create Poster"}
          icon={<ExpoMaterialIcons name="auto-awesome" size={20} />}
          loading={
            searchAlbumApi.isPending || searchTrackApi.isPending || !isTokenSet
          }
          onPress={search}
          disabled={searchType === "Choose type"}
          buttonClassName={"rounded-full"}
        />
      </Animated.View>
    </Background>
  );
}
