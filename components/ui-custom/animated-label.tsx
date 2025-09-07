import { cn } from "@/lib/utils";
import * as LabelPrimitive from "@rn-primitives/label";
import * as React from "react";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Create an animated version of Text component
const AnimatedText = Animated.createAnimatedComponent(LabelPrimitive.Text);

// Extend the props to include animation properties
interface AnimatedLabelProps extends LabelPrimitive.TextProps {
  colour?: string; // Single colour prop that accepts hex string
}

const AnimatedLabel = React.forwardRef<
  LabelPrimitive.TextRef,
  AnimatedLabelProps
>(
  (
    {
      className,
      onPress,
      onLongPress,
      onPressIn,
      onPressOut,
      colour,
      style,
      ...props
    },
    ref,
  ) => {
    // Create a shared value to track the current color
    const animatedColor = useSharedValue(colour);

    // Update animation when colour prop changes
    useEffect(() => {
      if (colour) {
        animatedColor.value = withTiming(colour, { duration: 300 });
      }
    }, [colour, animatedColor]);

    // Create animated style for text color
    const animatedStyle = useAnimatedStyle(() => {
      return {
        color: animatedColor.value,
      };
    });

    return (
      <LabelPrimitive.Root
        className="web:cursor-default"
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <AnimatedText
          ref={ref}
          className={cn(
            "text-sm text-foreground native:text-base font-ui-medium leading-none web:peer-disabled:cursor-not-allowed web:peer-disabled:opacity-70",
            className,
          )}
          style={[style, colour && animatedStyle]}
          {...props}
        />
      </LabelPrimitive.Root>
    );
  },
);

AnimatedLabel.displayName = LabelPrimitive.Root.displayName;

export { AnimatedLabel };
export type { AnimatedLabelProps };
