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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { searchHistoryTable } from "@/db/schema";
import useDatabase from "@/hooks/useDatabase";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { themes } from "@/lib/constants";
import { SearchType, ThemeTypes } from "@/lib/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";
import { notificationHaptic, selectionHaptic } from "@/utils/haptic-utils";
import { selectPoster } from "@/utils/poster-utils";
import { searchRegex } from "@/utils/text-utls";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ExpoMaterialCommunityIcons = cssInterop(MaterialCommunityIcons, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

export default function Search() {
  const { db } = useDatabase();
  useDrizzleStudio(db);
  const insets = useSafeAreaInsets();
  const isNarrow = useResponsiveLayout(400);
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
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
  const buttonVariant = isDarkColorScheme() ? "outline" : "secondary";

  useEffect(() => {
    const selector = selectPoster(searchType);
    setSearchParamDefault(selector.searchParam);
    setArtistNameDefault(selector.artistName);
  }, [searchType]);

  const onSuccess = (
    data: SearchAlbumResponse | SearchTrackResponse,
    variables: SearchAlbumRequest | SearchTrackRequest
  ) => {
    saveToDb(data, variables);
    router.navigate({
      pathname: "/[posterPath]",
      params: { posterPath: data.filePath, blurhash: data.blurhash },
    });
  };

  const onError = (error: unknown) => {
    console.log(error);
    let description = "Unknown error";
    if (error && typeof error === "object" && "message" in error) {
      description = String((error as { message?: unknown }).message);
    }
    toast.error("Search failed", {
      description: description || "Please try again",
    });
  };

  const searchAlbumApi = useAlbumSearchApi({
    onSuccess,
    onError,
  });

  const searchTrackApi = useTrackSearchApi({
    onSuccess,
    onError,
  });

  const search = () => {
    const sanitizedSearchParam = searchParam?.trim();
    setSearchParam(
      sanitizedSearchParam && sanitizedSearchParam.length > 0
        ? sanitizedSearchParam
        : undefined
    );
    const sanitizedArtistName = artistName?.trim();
    setArtistName(
      sanitizedArtistName && sanitizedArtistName.length > 0
        ? sanitizedArtistName
        : undefined
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
    responeData: SearchAlbumResponse | SearchTrackResponse,
    passedVariables: SearchAlbumRequest | SearchTrackRequest
  ) => {
    await db.insert(searchHistoryTable).values({
      searchType: "album_name" in passedVariables ? "Album" : "Track",
      searchParam:
        "albumName" in responeData
          ? responeData.albumName
          : responeData.trackName,
      artistName: responeData.artistName,
      theme: passedVariables.theme,
      accentLine: passedVariables.accent,
      blurhash: responeData.blurhash,
      createdAt: new Date(),
    });
  };

  return (
    <Background>
      <AnimatedHeader
        duration={500}
        offset={50}
        title="Search 🌟"
        description="Search for your favorite music or albums"
      />
      <KeyboardAwareScrollView
        className="flex-1"
        bottomOffset={30}
        fadingEdgeLength={100}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedCard className="dark:border-transparent">
          <CardHeader className="flex-row justify-between items-center">
            <Label>Search Type</Label>
            <View className="flex-row">
              <Button variant="ghost" onPress={toggleColorScheme}>
                <ExpoMaterialCommunityIcons
                  className="text-foreground"
                  size={23}
                  name={
                    isDarkColorScheme()
                      ? "white-balance-sunny"
                      : "moon-waning-crescent"
                  }
                />
              </Button>
              <Button
                variant="ghost"
                onPress={() => router.push("/search-history")}
              >
                <ExpoMaterialCommunityIcons
                  className="text-foreground"
                  size={23}
                  name={"history"}
                />
              </Button>
            </View>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={buttonVariant}>
                  <Text className="font-bold">{searchType}</Text>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 native:w-72">
                <Animated.View entering={FadeIn.duration(300)}>
                  <DropdownMenuLabel>Select a search type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
        <AnimatedCard
          index={0}
          className="mt-4 dark:border-transparent"
          disabled={searchType === "Choose type"}
        >
          <CardHeader>
            <Label className="">What are you looking for?</Label>
          </CardHeader>
          <CardContent>
            <AnimatedInput
              ref={searchParamRef}
              label={`${searchType} name`}
              editable={searchType !== "Choose type"}
              placeholder={`Eg. ${searchParamDefault}`}
              value={searchParam}
              onChangeText={setSearchParam}
            />
            <AnimatedInput
              ref={artistNameRef}
              label="Artist name"
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
              index={1}
              className="mt-4 dark:border-transparent flex-1"
              disabled={searchType === "Choose type"}
            >
              <CardHeader>
                <Label>Colour theme</Label>
              </CardHeader>
              <CardContent className="flex-1 content-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={buttonVariant}>
                      <Text className="font-bold">{theme}</Text>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 native:w-72"
                    insets={{ bottom: insets.bottom + 20 }}
                  >
                    <Animated.View entering={FadeIn.duration(300)}>
                      <DropdownMenuLabel>
                        Choose a colour theme
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
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
              index={2}
              className="mt-4 dark:border-transparent flex-1"
              disabled={searchType === "Choose type"}
            >
              <CardHeader>
                <Label>{isNarrow ? "Accent Line" : "Decor"}</Label>
              </CardHeader>
              <CardContent>
                <View
                  className={cn(
                    "items-center",
                    isNarrow ? "flex-col" : "flex-row"
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
            index={3}
            className="mt-4 border-0 items-center justify-center bg-transparent shadow-none"
            disabled={searchType === "Choose type"}
          >
            <MiniPoster theme={theme} accentEnabled={accentLine} />
          </AnimatedCard>
        </View>
      </KeyboardAwareScrollView>
      <AnimatedConfirmButton
        title="Create Poster"
        loading={searchAlbumApi.isPending || searchTrackApi.isPending}
        onPress={search}
        disabled={searchType === "Choose type"}
      />
    </Background>
  );
}
