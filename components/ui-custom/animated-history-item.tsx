import MiniPoster from "@/components/ui-custom/mini-poster";
import { SearchHistory } from "@/db/schema";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SWIPE_OFFSET = 40;
const SWIPE_THRESHOLD = SWIPE_OFFSET / 2;

const ExpoMaterialCommunityIcons = cssInterop(MaterialCommunityIcons, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

const AnimatedHistoryItem = ({ item, onDelete }: { item: SearchHistory, onDelete: () => void }) => {
  const swipeOffset = useSharedValue(0);
  const currentOffset = useSharedValue(0);

  const itemAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: swipeOffset.value }],
    };
  });

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      currentOffset.value = swipeOffset.value;
    })
    .onUpdate((event) => {
      // Only handle horizontal movement
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const newOffset = currentOffset.value + event.translationX;
        swipeOffset.value = Math.min(Math.max(newOffset, -SWIPE_OFFSET), 0);
      }
    })
    .onFinalize(() => {
      if (swipeOffset.value < -SWIPE_THRESHOLD) {
        swipeOffset.value = withTiming(-SWIPE_OFFSET, {
          easing: Easing.ease,
        });
      } else {
        swipeOffset.value = withTiming(0, { easing: Easing.ease });
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <Pressable
        onPress={() =>
          router.dismissTo({
            pathname: "/search",
            params: {
              dbSearchParam: item.searchParam,
              dbArtistName: item.artistName,
              dbSearchType: item.searchType,
              dbTheme: item.theme,
              dbAccentLine: item.accentLine.toString(),
            },
          })
        }
      >
        <View className="mb-4 mx-4 border-0 rounded overflow-hidden">
          <Animated.View style={itemAnimatedStyle} className="bg-background">
            <ImageBackground
              source={{ blurhash: item.blurhash || "" }}
              className="flex-1"
            >
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-background opacity-40 dark:opacity-20" />
              <View className="flex-row">
                <View className="flex-1 flex-row justify-between items-center p-5">
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
                      {item.theme +
                        (item.accentLine ? " with accent line" : "")}
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
                </View>
              </View>
            </ImageBackground>
          </Animated.View>
          <Pressable onPress={onDelete} className="absolute right-0 w-[40] h-full bg-destructive z-[-1] items-center justify-center">
            <ExpoMaterialCommunityIcons
              name="delete"
              size={24}
              className="text-background"
            />
          </Pressable>
        </View>
      </Pressable>
    </GestureDetector>
  );
};

export default AnimatedHistoryItem;
