import React, { useEffect } from "react";
import { ActivityIndicator, Text } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "../ui/button";

interface AnimatedConfirmButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  floating?: boolean;
  duration?: number;
  offset?: number;
  loading?: boolean;
}

const AnimatedConfirmButton = ({
  title = "Confirm",
  onPress = () => {},
  disabled = false,
  floating = false,
  duration = 500,
  offset = 100,
  loading = false,
}: AnimatedConfirmButtonProps) => {
  const footerPosition = useSharedValue(offset);

  useEffect(() => {
    if (!disabled) {
      footerPosition.value = withTiming(0, { duration });
    } else {
      footerPosition.value = withTiming(offset, { duration });
    }
  }, [disabled, duration, footerPosition, offset]);

  const animatedFooterStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: footerPosition.value },
        { scale: interpolate(footerPosition.value, [offset, 0], [0.8, 1]) },
      ],
      opacity: interpolate(footerPosition.value, [offset, 0], [0, 1]),
    };
  });

  return (
    <Animated.View
      style={animatedFooterStyle}
      className={`my-4 ${
        floating && `absolute bottom-[14] p-safe self-center w-full`
      }`}
    >
      <Button onPress={onPress} disabled={disabled || loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text>{title}</Text>
        )}
      </Button>
    </Animated.View>
  );
};

export default AnimatedConfirmButton;
