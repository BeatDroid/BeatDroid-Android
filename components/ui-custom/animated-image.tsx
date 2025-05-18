import { focusManager } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  uri: string;
  blurhash?: string;
  loading?: boolean;
  onPress?: () => void;
}

const maxVerticalAngle = 70;
const maxHorizontalAngle = 50;

const ExpoImage = cssInterop(Image, {
  className: {
    target: "style",
    nativeStyleToProp: { height: true, width: true },
  },
});

const AnimatedImage = ({ uri, blurhash, loading = true, onPress }: Props) => {
  const imageRef = React.useRef<Image>(null);
  const [isFocused, setIsFocused] = useState(false);
  const rotateY = useSharedValue<string>("0deg");
  const rotateX = useSharedValue<string>("0deg");
  const isPressed = useSharedValue<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const tap = Gesture.Tap().onEnd(() => {
    if (onPress && !loading) {
      runOnJS(onPress)();
    }
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      if (!loading) {
        isPressed.value = true;
      }
    })
    .onChange((event) => {
      rotateY.value = `${Math.min(
        Math.max(event.translationX, -maxVerticalAngle),
        maxVerticalAngle
      )}deg`;
      rotateX.value = `${Math.min(
        Math.max(-event.translationY, -maxHorizontalAngle),
        maxHorizontalAngle
      )}deg`;
    })
    .onFinalize(() => {
      rotateY.value = withSpring("0deg");
      rotateX.value = withSpring("0deg");
      isPressed.value = false;
    });

  const gesture = Gesture.Simultaneous(tap, pan);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { scale: withTiming(isPressed.value ? 0.95 : 1, { duration: 150 }) },
    ],
  }));

  if (!isFocused) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={`bg-transparent w-full h-auto overflow-hidden p-5`}
        style={animatedStyles}
      >
        <ExpoImage
          ref={imageRef}
          cachePolicy="none"
          source={
            loading
              ? {
                  blurhash,
                }
              : {
                  uri: uri.startsWith("data:")
                    ? uri
                    : `data:image/jpeg;base64,${uri}`,
                }
          }
          contentFit={loading ? "cover" : "contain"}
          transition={2000}
          className={"aspect-[0.65] w-full"}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default AnimatedImage;
