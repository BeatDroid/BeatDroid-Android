import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useCallback, useEffect, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  uri: string;
  blurhash?: string;
  loading?: boolean;
  onZoom?: (isPressed: boolean) => void;
  onPress?: () => void;
}

const maxHorizontalAngle = 50;

const ExpoImageBase = React.forwardRef<Image, any>((props, ref) => (
  <Image ref={ref} {...props} />
));

ExpoImageBase.displayName = "ExpoImageBase";

const ExpoImage = cssInterop(ExpoImageBase, {
  className: {
    target: "style",
    nativeStyleToProp: { height: true, width: true },
  },
});

const AnimatedImage = ({ uri, blurhash, loading = true }: Props) => {
  const imageRef = React.useRef<Image>(null);
  const [isFocused, setIsFocused] = useState(false);
  const rotateY = useSharedValue<string>("0deg");
  const rotateX = useSharedValue<string>("0deg");

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );


  const spin = useCallback(() => {
    "worklet";
    rotateY.value = withSequence(
      withTiming(`${-45}deg`, { duration: 200 }),
      withSpring(`${720}deg`, {stiffness: 50, damping: 20, mass: 5}),
      withTiming(`0deg`, { duration: 0 })
    );
  }, [rotateY]);

  useEffect(() => {
    if (!loading) spin();
  }, [loading, spin]);

  const pan = Gesture.Pan()
    .onChange((event) => {
      if (!loading) {
        rotateY.value = `${event.translationX}deg`;
        rotateX.value = `${Math.min(
          Math.max(-event.translationY, -maxHorizontalAngle),
          maxHorizontalAngle
        )}deg`;
      }
    })
    .onFinalize(() => {
      const rotationY = parseFloat(rotateY.value);
      const nearestMultiple = Math.round(rotationY / 360) * 360;
      rotateY.value = withSpring(`${nearestMultiple}deg`);
      rotateX.value = withSpring("0deg");
    });

  const gesture = Gesture.Simultaneous(pan);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { scale: 0.9 },
    ],
    borderRadius: withTiming(loading ? 10 : 0, { duration: 300 }),
  }));

  if (!isFocused) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={`bg-transparent overflow-hidden aspect-[0.65] h-full w-auto self-center items-center justify-center`}
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
                  uri: uri?.startsWith("data:")
                    ? uri
                    : `data:image/jpeg;base64,${uri}`,
                }
          }
          contentFit={loading ? "cover" : "contain"}
          transition={2000}
          className={"aspect-[0.65] h-full w-auto"}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default AnimatedImage;
