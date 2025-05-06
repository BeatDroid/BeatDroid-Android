import { ViewRef } from "@rn-primitives/types";
import React, { ReactNode, useEffect } from "react";
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
  children: ReactNode;
  className?: string;
}

const AnimatedCard = React.forwardRef<ViewRef, AnimatedCardProps>(
  ({ disabled = false, children, className, ...props }, ref) => {
    const footerPosition = useSharedValue(offset);

    useEffect(() => {
      if (!disabled) {
        footerPosition.value = withTiming(0, { duration });
      } else {
        footerPosition.value = withTiming(offset, { duration });
      }
    }, [disabled, footerPosition]);

    const animatedFooterStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: footerPosition.value }],
        opacity: interpolate(footerPosition.value, [offset, 0], [0, 1]),
      };
    });

    return (
      <Animated.View style={animatedFooterStyle}>
        <Card ref={ref} className={className} {...props}>
          {children}
        </Card>
      </Animated.View>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;
