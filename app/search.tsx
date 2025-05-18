import { useAlbumSearchApi } from "@/api/search-album/useSearchAlbumApi";
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
import { ThemeTypes } from "@/lib/types";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { toast } from "sonner-native";

export default function Search() {
  const [searchType, setSearchType] = useState("Choose type");
  const [searchParam, setSearchParam] = useState("Abbey Road");
  const [artistName, setArtistName] = useState("The Beatles");
  const [theme, setTheme] = useState<ThemeTypes>("Dark");
  const [accentLine, setAccentLine] = useState(false);

  const searchAlbumApi = useAlbumSearchApi({
    onSuccess: (data) => {
      router.navigate({
        pathname: "/[posterPath]",
        params: { posterPath: data.filePath, blurhash: data.blurhash },
      });
    },
    onError: (error: unknown) => {
      console.log(error);
      let description = "Unknown error";
      if (error && typeof error === "object" && "message" in error) {
        description = String((error as { message?: unknown }).message);
      }
      toast.error("Search failed", { description });
    },
  });

  return (
    <Background>
      <AnimatedHeader
        duration={500}
        offset={50}
        title="Search 🔍"
        description="Search for your favorite music or albums"
      />
      <View className="flex-1">
        <AnimatedCard className="border-0">
          <CardHeader>
            <Label>Search Type</Label>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Text className="font-bold">{searchType}</Text>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 native:w-72">
                <Animated.View entering={FadeIn.duration(300)}>
                  <DropdownMenuLabel>Select a search type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      disabled
                      onPress={() => setSearchType("Track")}
                    >
                      <Text>Track (Coming Soon)</Text>
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
          className="mt-4 border-0"
          disabled={searchType === "Choose type"}
        >
          <CardHeader>
            <Label className="">What are you looking for?</Label>
          </CardHeader>
          <CardContent>
            <Input
              // editable={searchType !== "Choose type"}
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
              // editable={searchType !== "Choose type"}
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
        <View className="flex-row w-full">
          <View className="flex-1 h-[250]">
            <AnimatedCard
              className="mt-4 border-0 flex-1"
              disabled={searchType === "Choose type"}
            >
              <CardHeader>
                <Label>Colour theme</Label>
              </CardHeader>
              <CardContent className="flex-1 content-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Text className="font-bold">{theme}</Text>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 native:w-72">
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
              className="mt-4 border-primary border-0 flex-1"
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
                    className="ml-6"
                    nativeID="accent-line"
                    onPress={() => {
                      setAccentLine((prev) => !prev);
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
            className="mt-4 border-0 items-center justify-center bg-transparent shadow-none"
            disabled={searchType === "Choose type"}
          >
            <MiniPoster theme={theme} accentEnabled={accentLine} />
          </AnimatedCard>
        </View>
      </View>
      <AnimatedConfirmButton
        floating
        title="Create"
        loading={searchAlbumApi.isPending}
        onPress={() =>
          searchAlbumApi.mutate({
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
