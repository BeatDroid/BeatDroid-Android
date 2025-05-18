import { ViewRef } from "@rn-primitives/types";
import React, { useEffect } from "react";
import { ViewProps } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Card } from "../ui/card";

const offset = 50;
const duration = 500;

interface AnimatedCardProps extends ViewProps {
  disabled?: boolean;
  color?: string;
}

const AnimatedCardComponent = Animated.createAnimatedComponent(Card);

const AnimatedCard = React.forwardRef<ViewRef, AnimatedCardProps>(
  ({ disabled = false, color, ...props }, ref) => {
    const footerPosition = useSharedValue(offset);

    useEffect(() => {
      if (!disabled) {
        footerPosition.value = withTiming(0, { duration });
      } else {
        footerPosition.value = withTiming(offset, { duration });
      }
    }, [disabled, footerPosition]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: footerPosition.value }],
        opacity: interpolate(footerPosition.value, [offset, 0], [0, 1]),
        ...(color && {
          backgroundColor: withTiming(color, { duration }),
        }),
      };
    });

    return (
      <AnimatedCardComponent 
        ref={ref} 
        style={animatedStyle} 
        pointerEvents="box-none"
        {...props} 
      />
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;
