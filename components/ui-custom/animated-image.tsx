import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  uri: string;
}

const maxVerticalAngle = 70;
const maxHorizontalAngle = 50;

const ExpoImage = cssInterop(Image, {
  className: {
    target: "style",
    nativeStyleToProp: { height: true, width: true },
  },
});

const AnimatedImage = ({ uri }: Props) => {
  const imageRef = React.useRef<Image>(null);
  const rotateY = useSharedValue<string>("0deg");
  const rotateX = useSharedValue<string>("0deg");
  const isPressed = useSharedValue<boolean>(false);

  const pan = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
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

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { scale: withTiming(isPressed.value ? 0.95 : 1) },
    ],
  }));

  const blurHash = `LKJbT+Mx-po#1MaKs.kC~UofM{WB`;

  const imageBaseUri = uri.startsWith("data:")
    ? uri
    : `data:image/jpeg;base64,${uri}`;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className={`bg-transparent w-full h-auto overflow-hidden`}
        style={animatedStyles}
      >
        <ExpoImage
          ref={imageRef}
          source={{
            uri: imageBaseUri,
          }}
          contentFit="contain"
          placeholder={{ blurHash }}
          transition={2000}
          className={"h-full w-full"}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default AnimatedImage;
