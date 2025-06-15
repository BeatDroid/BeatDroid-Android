import React, { useEffect } from "react";
import { ActivityIndicator, Text } from "react-native";
import Animated, {
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
  loading?: boolean;
}

const AnimatedConfirmButton = ({
  title = "Confirm",
  onPress = () => {},
  disabled = false,
  floating = false,
  duration = 500,
  loading = false,
}: AnimatedConfirmButtonProps) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!disabled) {
      opacity.value = withTiming(1, { duration });
    } else {
      opacity.value = withTiming(0, { duration });
    }
  }, [disabled, duration, opacity]);

  const animatedFooterStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={animatedFooterStyle}
      className={`my-4 ${
        floating && `absolute bottom-[14] p-safe self-center w-full`
      }`}
      pointerEvents="box-none"
    >
      <Button
        onPress={onPress}
        disabled={disabled || loading}
        visiblyDisabled={false || loading}
        className="active:opacity-80"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text className="text-center font-bold">{title}</Text>
        )}
      </Button>
    </Animated.View>
  );
};

export default AnimatedConfirmButton;
