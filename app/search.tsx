import { useAlbumSearchApi } from "@/api/search-album/useAlbumSearchApi";
import { SearchAlbumResponse } from "@/api/search-album/zod-schema";
import { useTrackSearchApi } from "@/api/search-track/useTrackSearchApi";
import { SearchTrackResponse } from "@/api/search-track/zod-schema";
import AnimatedCard from "@/components/ui-custom/animated-card";
import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedHeader from "@/components/ui-custom/animated-header";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { themes } from "@/lib/constants";
import { SearchType, ThemeTypes } from "@/lib/types";
import { useColorScheme } from "@/lib/useColorScheme";
import { selectionHaptic } from "@/utils/haptic-utils";
import { selectPoster } from "@/utils/poster-utils";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
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
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const [searchType, setSearchType] = useState<SearchType>("Choose type");
  const [searchParam, setSearchParam] = useState("Abbey Road");
  const [artistName, setArtistName] = useState("The Beatles");
  const [theme, setTheme] = useState<ThemeTypes>("Dark");
  const [accentLine, setAccentLine] = useState(false);
  const buttonVariant = isDarkColorScheme ? "outline" : "secondary";

  useEffect(() => {
    const selector = selectPoster(searchType);
    setSearchParam(selector.searchParam);
    setArtistName(selector.artistName);
  }, [searchType]);

  const onSuccess = (data: SearchAlbumResponse | SearchTrackResponse) => {
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
      description: __DEV__ ? description : "Please try again",
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

  return (
    <Background>
      <AnimatedHeader
        duration={500}
        offset={50}
        title="Search 🔍"
        description="Search for your favorite music or albums"
      />
      <ScrollView className="flex-1">
        <AnimatedCard className="dark:border-transparent">
          <CardHeader className="flex-row justify-between items-center">
            <Label>Search Type</Label>
            <Button variant="ghost" onPress={() => toggleColorScheme()}>
              <ExpoMaterialCommunityIcons
                className="text-foreground"
                size={23}
                name={
                  isDarkColorScheme
                    ? "white-balance-sunny"
                    : "moon-waning-crescent"
                }
              />
            </Button>
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
            <Input
              editable={searchType !== "Choose type"}
              placeholder={
                searchType === "Choose type"
                  ? "Select search type first"
                  : `Enter ${searchType.toLowerCase()} name`
              }
              value={searchParam}
              onChangeText={setSearchParam}
            />
            <Input
              className="mt-5"
              editable={searchType !== "Choose type"}
              placeholder={
                searchType === "Choose type"
                  ? "Select search type first"
                  : `Enter artist name`
              }
              value={artistName}
              onChangeText={setArtistName}
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
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>
                        Choose a colour theme
                      </DropdownMenuLabel>
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
                <Label>Decor</Label>
              </CardHeader>
              <CardContent>
                <View className="flex-row items-center mt-1">
                  <Switch
                    checked={accentLine}
                    onCheckedChange={setAccentLine}
                    nativeID="accent-line"
                  />
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
      </ScrollView>
      <AnimatedConfirmButton
        title="Create"
        loading={searchAlbumApi.isPending || searchTrackApi.isPending}
        onPress={() =>
          searchType === "Track"
            ? searchTrackApi.mutate({
                track_name: searchParam,
                artist_name: artistName,
                theme,
                accent: accentLine,
              })
            : searchAlbumApi.mutate({
                album_name: searchParam,
                artist_name: artistName,
                theme,
                accent: accentLine,
              })
        }
        disabled={
          searchType === "Choose type" ||
          searchParam === "" ||
          artistName === ""
        }
      />
    </Background>
  );
}
