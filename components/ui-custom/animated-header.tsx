import React, { useEffect } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/text";

interface AnimatedHeaderProps {
  title: string;
  description: string;
  disabled?: boolean;
  duration?: number;
  offset?: number;
}

const AnimatedHeader = ({
  title,
  description,
  disabled = false,
  duration = 1000,
  offset = 100,
}: AnimatedHeaderProps) => {
  const headerPosition = useSharedValue(-offset);

  useEffect(() => {
    if (!disabled) {
      headerPosition.value = withTiming(0, { duration });
    }

    return () => {
      headerPosition.value = withTiming(-offset, { duration });
    };
  }, [disabled, duration, headerPosition, offset]);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: headerPosition.value },
        {scale: interpolate(headerPosition.value, [-offset, 0], [0.8, 1])},
        {
          rotateX: `${interpolate(
            headerPosition.value,
            [-offset, 0],
            [160, 0]
          )}deg`,
        },
      ],
      opacity: interpolate(headerPosition.value, [-offset*0.4, 0], [0, 1]),
    };
  });

  return (
    <Animated.View
      style={animatedHeaderStyle}
      className="h-[100] items-center justify-center"
    >
      <Text className="text-2xl font-bold mb-3 text-center">{title}</Text>
      <Text className="text-base text-center">{description}</Text>
    </Animated.View>
  );
};

export default AnimatedHeader;
