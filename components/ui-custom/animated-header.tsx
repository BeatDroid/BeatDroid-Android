import { useFocusEffect } from "expo-router";
import React from "react";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/text";

interface AnimatedHeaderProps {
  title: string;
  description?: string;
  disabled?: boolean;
  duration?: number;
  offset?: number;
}

const AnimatedHeader = ({
  title,
  description,
  disabled = false,
  duration = 300,
  offset = 10,
}: AnimatedHeaderProps) => {
  const headerPosition = useSharedValue(-offset);

  useFocusEffect(
    React.useCallback(() => {
      if (!disabled) {
        headerPosition.value = withTiming(0, { duration });
      }

      return () => {
        headerPosition.value = withTiming(-offset, {
          duration,
          easing: Easing.ease,
        });
      };
    }, [disabled, duration, headerPosition, offset]),
  );

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: headerPosition.value }],
      opacity: interpolate(headerPosition.value, [-offset * 1, 0], [0, 1]),
    };
  });

  return (
    <Animated.View
      style={animatedHeaderStyle}
      className="h-[100] items-start justify-center"
    >
      <Text className="text-4xl leading-tight font-ui-bold mb-2 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-center">{description}</Text>
      )}
    </Animated.View>
  );
};

export default AnimatedHeader;
