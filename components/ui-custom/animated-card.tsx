import { ViewRef } from "@rn-primitives/types";
import React, { useEffect } from "react";
import { ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Card } from "../ui/card";

const initialOpacity = 0; // Start from fully transparent
const targetOpacity = 1; // Animate to fully opaque
const duration = 500;
const delayBetweenCards = 200; // Delay between each card's animation

interface AnimatedCardProps extends ViewProps {
  disabled?: boolean;
  color?: string;
  delay?: number; // Delay in milliseconds
  index?: number; // Index for sequencing
}

const AnimatedCardComponent = Animated.createAnimatedComponent(Card);

const AnimatedCard = React.forwardRef<ViewRef, AnimatedCardProps>(
  (
    { disabled = false, color, delay = undefined, index = 0, style, ...props },
    ref
  ) => {
    const opacity = useSharedValue(initialOpacity);

    useEffect(() => {
      if (!disabled) {
        // Calculate delay based on index if no explicit delay is provided
        const calculatedDelay =
          delay !== undefined ? delay : index * delayBetweenCards;
        opacity.value = withDelay(
          calculatedDelay,
          withTiming(targetOpacity, { duration })
        );
      } else {
        opacity.value = withTiming(initialOpacity, { duration });
      }
    }, [disabled, opacity, delay, index]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        ...(color && {
          backgroundColor: withTiming(color, { duration }),
        }),
      };
    });

    return (
      <AnimatedCardComponent
        ref={ref}
        style={[animatedStyle, style]}
        pointerEvents={disabled ? "none" : "box-none"}
        {...props}
      />
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;
