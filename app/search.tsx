import { useAlbumSearchApi } from "@/api/search-album/useSearchAlbumApi";
import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedHeader from "@/components/ui-custom/animated-header";
import Background from "@/components/ui-custom/background";
import { Button } from "@/components/ui/button";
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
import { parsePosterUrl } from "@/utils/text-utls";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { toast } from "sonner-native";

type ThemeTypes =
  | "Light"
  | "Dark"
  | "Catppuccin"
  | "Gruvbox"
  | "Nord"
  | "RosePine"
  | "Everforest";

const themes: ThemeTypes[] = [
  "Light",
  "Dark",
  "Catppuccin",
  "Gruvbox",
  "Nord",
  "RosePine",
  "Everforest",
];

export default function Search() {
  const [searchType, setSearchType] = useState("Choose type");
  const [searchParam, setSearchParam] = useState("Abbey Road");
  const [artistName, setArtistName] = useState("The Beatles");
  const [theme, setTheme] = useState<ThemeTypes>("Dark");
  const [accentLine, setAccentLine] = useState(false);

  const searchAlbumApi = useAlbumSearchApi({
    onSuccess: (data) => {
      router.navigate({
        pathname: "/[posterview]",
        params: { posterview: parsePosterUrl(data) },
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
        title="Search 🔍"
        description="Search for your favorite music or albums"
      />
      <View className="flex-1">
        <Label className="pt-10 pb-4">Search Type</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Text>{searchType}</Text>
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
        <Label className="py-4">What are you looking for?</Label>
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
        <Label className="py-4">A splash of color maybe?</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Text>{theme}</Text>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 native:w-72">
            <Animated.View entering={FadeIn.duration(300)}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Choose a colour theme</DropdownMenuLabel>
              {themes.map((theme) => (
                <DropdownMenuItem key={theme} onPress={() => setTheme(theme)}>
                  <Text>{theme}</Text>
                </DropdownMenuItem>
              ))}
            </Animated.View>
          </DropdownMenuContent>
        </DropdownMenu>
        <Label className="py-4">With a cherry on top?</Label>
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
            Accent line below poster
          </Label>
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
