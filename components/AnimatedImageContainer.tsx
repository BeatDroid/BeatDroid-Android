import React from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  uri: string | undefined;
}

const maxVerticalAngle = 70;
const maxHorizontalAngle = 50;

const AnimatedImageContainer = ({ uri }: Props) => {
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

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.interactiveSquare, animatedStyles]}>
        {uri ? (
          <Image
            source={{
              uri,
            }}
            style={styles.poster}
            fadeDuration={2000}
          />
        ) : (
          <View style={styles.centre}>
            <ActivityIndicator size={"large"} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export default AnimatedImageContainer;

const styles = StyleSheet.create({
  interactiveSquare: {
    backgroundColor: "transparent",
    aspectRatio: 0.66666666666,
    width: "100%",
    height: "auto",
    overflow: "hidden",
  },
  poster: {
    flex: 1,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
