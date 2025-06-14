import { cn } from "@/lib/utils";
import { Label } from "@rn-primitives/dropdown-menu";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Input } from "../ui/input";

interface AnimatedInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "className" | "placeholder"
  > {
  label?: string;
  placeholder?: string;
  className?: string;
  textInputClassName?: string;
  labelClassName?: string;
}

const ANIMATION_DURATION = 200;
const ANIMATION_CONFIG = { duration: ANIMATION_DURATION };

const AnimatedInput = ({
  label,
  placeholder,
  className,
  textInputClassName,
  labelClassName,
  ...props
}: AnimatedInputProps) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    Boolean(props.value || props.defaultValue)
  );
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const focusedValue = useSharedValue(0);

  React.useEffect(() => {
    focusedValue.value = withTiming(
      isInputFocused || hasValue ? 1 : 0,
      ANIMATION_CONFIG
    );
  }, [isInputFocused, hasValue, focusedValue]);

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isInputFocused) {
      timeoutId = setTimeout(() => {
        setShowPlaceholder(true);
      }, ANIMATION_DURATION - 100);
    } else {
      setShowPlaceholder(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isInputFocused]);

  const animatedContainerStyle = useAnimatedStyle(
    () => ({
      marginTop: focusedValue.value * 20,
    }),
    []
  );

  const animatedLabelStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: focusedValue.value * -35,
        },
        {
          translateX: focusedValue.value * -10,
        },
      ],
    }),
    []
  );

  const handleFocus = useCallback(
    (e: any) => {
      setIsInputFocused(true);
      props.onFocus?.(e);
    },
    [props]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsInputFocused(false);
      props.onBlur?.(e);
    },
    [props]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      setHasValue(Boolean(text));
      props.onChangeText?.(text);
    },
    [props]
  );

  const currentPlaceholder = useMemo(() => {
    return showPlaceholder ? placeholder : "";
  }, [showPlaceholder, placeholder]);
  const containerClassName = useMemo(() => className, [className]);
  const inputClassName = useMemo(
    () => textInputClassName,
    [textInputClassName]
  );
  const labelClasses = useMemo(
    () => cn("text-muted-foreground", labelClassName),
    [labelClassName]
  );

  return (
    <View className={containerClassName}>
      <Animated.View style={animatedContainerStyle}>
        {label && (
          <Animated.View
            className="z-[1] absolute top-3 left-3"
            style={animatedLabelStyle}
            entering={FadeIn.duration(ANIMATION_DURATION)}
            pointerEvents="box-none"
          >
            <Label className={labelClasses}>{label}</Label>
          </Animated.View>
        )}
        <Input
          {...props}
          placeholder={currentPlaceholder}
          className={inputClassName}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
        />
      </Animated.View>
    </View>
  );
};

export default React.memo(AnimatedInput);
