import { themes } from "@/lib/constants";
import { ThemeTypes } from "@/lib/types";
import { cn } from "@/lib/utils";
import * as Sentry from "@sentry/react-native";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface MiniPosterProps {
  theme?: ThemeTypes;
  accentEnabled?: boolean;
  className?: string;
}

const DURATION = 500;

const MiniPoster = ({
  theme = "Light",
  accentEnabled = false,
  className = "",
}: MiniPosterProps) => {
  const backgroundColor = useSharedValue(themes[theme].bg);
  const posterColor = useSharedValue(themes[theme].fg);
  const textColor = useSharedValue(themes[theme].text);
  const b1color = useSharedValue(themes[theme].b1);
  const b2color = useSharedValue(themes[theme].b2);
  const b3color = useSharedValue(themes[theme].b3);
  const accentLine = useSharedValue(accentEnabled ? 1 : 0);

  useEffect(() => {
    accentLine.value = withTiming(accentEnabled ? 1 : 0, {
      duration: DURATION,
    });
    backgroundColor.value = withTiming(themes[theme].bg, {
      duration: DURATION,
    });
    posterColor.value = withTiming(themes[theme].fg, { duration: DURATION });
    textColor.value = withTiming(themes[theme].text, { duration: DURATION });
    b1color.value = withTiming(themes[theme].b1, { duration: DURATION });
    b2color.value = withTiming(themes[theme].b2, { duration: DURATION });
    b3color.value = withTiming(themes[theme].b3, { duration: DURATION });
  }, [
    accentEnabled,
    accentLine,
    b1color,
    b2color,
    b3color,
    backgroundColor,
    posterColor,
    textColor,
    theme,
  ]);

  const posterStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: posterColor.value,
    };
  });

  const previewTextStyle = useAnimatedStyle(() => {
    return {
      color: backgroundColor.value,
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: backgroundColor.value,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: textColor.value,
    };
  });

  const b1Style = useAnimatedStyle(() => {
    return {
      backgroundColor: b1color.value,
    };
  });

  const b2Style = useAnimatedStyle(() => {
    return {
      backgroundColor: b2color.value,
    };
  });

  const b3Style = useAnimatedStyle(() => {
    return {
      backgroundColor: b3color.value,
    };
  });

  const accentLineStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        accentEnabled ? posterColor.value : "transparent",
        { duration: 200 },
      ),
    };
  });

  return (
    <Animated.View
      style={backgroundStyle}
      className={cn(
        "aspect-[7.3/10] h-full self-center pt-2 rounded-lg overflow-hidden",
        className,
      )}
    >
      <Animated.View
        style={posterStyle}
        className="flex-1 mx-2 rounded-sm items-center justify-center"
      >
        <Animated.Text
          style={previewTextStyle}
          className="text-md font-ui-bold uppercase text-center"
        >
          {"T h e m e\nP r e v i e w"}
        </Animated.Text>
      </Animated.View>
      <Animated.View
        style={textStyle}
        className="mt-2 h-3 w-[75%] mx-2 rounded-full"
      />
      <View className="flex-row items-center justify-between mx-2">
        <Animated.View
          style={textStyle}
          className="mt-1 h-1 w-[65%] rounded-full"
        />
        <View className="flex-row items-center">
          <Animated.View
            style={textStyle}
            className="mt-1 ml-1 aspect-[1] w-[5] rounded-full"
          />
          <Animated.View
            style={b1Style}
            className="mt-1 ml-1 aspect-[1] w-[5] rounded-full"
          />
          <Animated.View
            style={b2Style}
            className="mt-1 ml-1 aspect-[1] w-[5] rounded-full"
          />
          <Animated.View
            style={b3Style}
            className="mt-1 ml-1 aspect-[1] w-[5] rounded-full"
          />
        </View>
      </View>
      <Animated.View
        style={textStyle}
        className="mt-2 mx-2 h-1.5 w-[45%] rounded-full"
      />
      <Animated.View
        style={textStyle}
        className="mt-1 mx-2 h-1.5 w-[60%] rounded-full"
      />
      <Animated.View
        style={textStyle}
        className="mt-1 mx-2 h-1.5 w-[30%] rounded-full"
      />
      <Animated.View style={accentLineStyle} className="mt-2 h-1 w-full" />
    </Animated.View>
  );
};

export default Sentry.withProfiler(MiniPoster);
