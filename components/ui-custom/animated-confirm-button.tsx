import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "../ui/button";

interface AnimatedConfirmButtonProps {
  title: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  floating?: boolean;
  occupySpaceWhenHidden?: boolean;
  duration?: number;
  loading?: boolean;
  buttonClassName?: string;
}

const AnimatedConfirmButton = ({
  title = "Confirm",
  icon,
  onPress = () => {},
  disabled = false,
  floating = false,
  occupySpaceWhenHidden = true,
  duration = 500,
  loading = false,
  buttonClassName = "",
}: AnimatedConfirmButtonProps) => {
  const opacity = useSharedValue(0);
  const [hideComponent, setHideComponent] = useState(false);

  useEffect(() => {
    if (!disabled) {
      setHideComponent(false);
      opacity.value = withTiming(1, { duration });
    } else {
      opacity.value = withTiming(0, { duration }, (finished) => {
        if (finished && !occupySpaceWhenHidden) {
          runOnJS(setHideComponent)(true);
        }
      });
    }
  }, [disabled, duration, occupySpaceWhenHidden, opacity]);

  const animatedFooterStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (hideComponent) return null;

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
        visiblyDisabled={loading}
        className={cn("active:opacity-80", buttonClassName)}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <View className={"flex-row items-center justify-center"}>
            {icon && <View className="mr-2">{icon}</View>}
            <Text className="text-center font-ui-bold">{title}</Text>
          </View>
        )}
      </Button>
    </Animated.View>
  );
};

export default AnimatedConfirmButton;
