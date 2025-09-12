import { cn } from "@/lib/utils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { cssInterop } from "nativewind";
import * as React from "react";
import { useEffect } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface CustomTabButtonProps
  extends React.PropsWithChildren,
    Omit<TabTriggerSlotProps, "style"> {
  icon: keyof typeof FontAwesome.glyphMap;
  style?: PressableProps["style"];
}

const ExpoFontAwesome = cssInterop(FontAwesome, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

export default function Layout() {
  return (
    <Tabs
      options={{ backBehavior: "initialRoute", initialRouteName: "search" }}
    >
      <TabSlot />
      <TabList
        className={
          "center-items justify-center w-full px-3 pb-safe-offset-2 pt-6 bg-secondary"
        }
      >
        <TabTrigger
          name="search-history"
          href="/(home-tabs)/search-history"
          asChild
        >
          <CustomTabButton icon="history">History</CustomTabButton>
        </TabTrigger>
        <TabTrigger name="search" href="/(home-tabs)/search" asChild>
          <CustomTabButton icon="search">Search</CustomTabButton>
        </TabTrigger>
        <TabTrigger name="settings" href="/(home-tabs)/settings" asChild>
          <CustomTabButton icon="cog">Settings</CustomTabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const DURATION = 200;
const INITIAL_WIDTH = 40;
const FINAL_WIDTH = 60;

const CustomTabButton = React.forwardRef<View, CustomTabButtonProps>(
  (props, ref) => {
    const { isFocused } = props;
    const bgWidth = useSharedValue(INITIAL_WIDTH);

    useEffect(() => {
      if (isFocused)
        bgWidth.value = withTiming(FINAL_WIDTH, { duration: DURATION });
      return () => {
        bgWidth.value = withTiming(INITIAL_WIDTH, { duration: DURATION });
      };
    }, [bgWidth, isFocused]);

    const animatedBg = useAnimatedStyle(() => {
      return {
        width: `${bgWidth.value}%`,
        height: 30,
        opacity: interpolate(
          bgWidth.value,
          [INITIAL_WIDTH, FINAL_WIDTH],
          [0, 1],
        ),
      };
    });

    return (
      <Pressable
        ref={ref}
        {...props}
        style={StyleSheet.flatten([props.style, { flexDirection: "column" }])}
        className={cn(`py-2 px-4 w-1/3 items-center self-center rounded-xl`)}
      >
        <View className={"items-center justify-center w-full"}>
          <Animated.View
            style={animatedBg}
            className={cn(
              "rounded-full self-center absolute",
              isFocused ? "bg-primary" : "bg-secondary",
            )}
          />
          <ExpoFontAwesome
            name={props.icon}
            size={24}
            className={cn(
              "py-2",
              isFocused ? "text-primary-foreground" : "text-muted-foreground",
            )}
          />
        </View>
        <Text className={"text-muted-foreground font-ui-bold text-s"}>
          {props.children}
        </Text>
      </Pressable>
    );
  },
);

CustomTabButton.displayName = "CustomTabButton";
