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
import { Text } from "@/components/ui/text";
import { parsePosterUrl } from "@/utils/text-utls";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { toast } from "sonner-native";

export default function Search() {
  const [searchType, setSearchType] = useState("Choose type");
  const [searchParam, setSearchParam] = useState("Abbey Road");
  const [artistName, setArtistName] = useState("The Beatles");

  const searchAlbumApi = useAlbumSearchApi({
    onSuccess: (data) => {
      router.navigate({
        pathname: "/[posterview]",
        params: { posterview: parsePosterUrl(data) },
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Search failed", {
        description: error?.message ?? "Unknown error",
      });
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
      </View>
      <AnimatedConfirmButton
        floating
        title="Search"
        loading={searchAlbumApi.isPending}
        onPress={() =>
          searchAlbumApi.mutate({ album: searchParam, artist: artistName })
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
