import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

interface Props {
  uri: string;
  blurhash?: string;
  loading?: boolean;
  onZoom?: (isPressed: boolean) => void;
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

const AnimatedImage = ({
  uri,
  blurhash,
  loading = true,
  onZoom,
  onPress,
}: Props) => {
  const imageRef = React.useRef<Image>(null);
  const [isFocused, setIsFocused] = useState(false);
  const rotateY = useSharedValue<string>("0deg");
  const rotateX = useSharedValue<string>("0deg");
  const isZoomed = useSharedValue<number>(0);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const tap = Gesture.Tap().onEnd(() => {
    if (!loading) {
      if (onPress) {
        runOnJS(onPress)();
      }
      if (onZoom) {
        runOnJS(onZoom)(isZoomed.value === 1);
      }
      isZoomed.value = isZoomed.value === 1 ? 0 : 1;
    }
  });

  const pan = Gesture.Pan()
    .onChange((event) => {
      if (!loading) {
        rotateY.value = `${Math.min(
          Math.max(event.translationX, -maxVerticalAngle),
          maxVerticalAngle
        )}deg`;
        rotateX.value = `${Math.min(
          Math.max(-event.translationY, -maxHorizontalAngle),
          maxHorizontalAngle
        )}deg`;
      }
    })
    .onFinalize(() => {
      rotateY.value = withSpring("0deg");
      rotateX.value = withSpring("0deg");
    });

  const gesture = Gesture.Simultaneous(tap, pan);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { scale: withTiming(isZoomed.value === 1 ? 1.15 : 0.9, { duration: 300 }) },
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
