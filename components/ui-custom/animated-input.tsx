import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { TextInput, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Input } from "../ui/input";

export interface AnimatedInputRef {
  shake: () => void;
  focus: () => void;
  blur: () => void;
  clear: () => void;
  clearError: () => void;
}

interface AnimatedInputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  placeholder?: string;
  className?: string;
  textInputClassName?: string;
  labelClassName?: string;
}

const ANIMATION_DURATION = 200;
const PLACEHOLDER_DELAY = 100;
const SHAKE_DISTANCE = 10;
const SHAKE_TIMING = 80;

const ANIMATION_CONFIG = { duration: ANIMATION_DURATION } as const;
const SHAKE_CONFIG = { duration: SHAKE_TIMING } as const;

const AnimatedInput = forwardRef<AnimatedInputRef, AnimatedInputProps>(
  (
    {
      label,
      placeholder,
      className,
      textInputClassName,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<TextInput>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const shakeAnimation = useSharedValue(0);
    const focusedValue = useSharedValue(0);

    const [isInputFocused, setIsInputFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(props.value || props.defaultValue),
    );
    const [showPlaceholder, setShowPlaceholder] = useState(false);
    const [hasError, setHasError] = useState(false);

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const updateFocusAnimation = useCallback(
      (focused: boolean, value: boolean) => {
        "worklet";
        focusedValue.value = withTiming(
          focused || value ? 1 : 0,
          ANIMATION_CONFIG,
        );
      },
      [focusedValue],
    );

    React.useEffect(() => {
      updateFocusAnimation(isInputFocused, hasValue);
    }, [isInputFocused, hasValue, updateFocusAnimation]);

    const setPlaceholderVisible = useCallback((visible: boolean) => {
      setShowPlaceholder(visible);
    }, []);

    React.useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (isInputFocused) {
        timeoutRef.current = setTimeout(() => {
          setPlaceholderVisible(true);
          timeoutRef.current = null;
        }, PLACEHOLDER_DELAY);
      } else {
        setPlaceholderVisible(false);
      }
    }, [isInputFocused, setPlaceholderVisible]);

    React.useEffect(() => {
      if (props.value) {
        setHasValue(true);
      } else {
        setHasValue(false);
      }
    }, [props]);

    const animatedContainerStyle = useAnimatedStyle(
      () => ({
        marginTop: focusedValue.value * 20,
        transform: [{ translateX: shakeAnimation.value }],
      }),
      [],
    );

    const animatedLabelStyle = useAnimatedStyle(
      () => ({
        transform: [
          { translateY: focusedValue.value * -35 },
          { translateX: focusedValue.value * -10 },
        ],
      }),
      [],
    );

    const handleFocus = useCallback(
      (e: any) => {
        setHasError(false);
        setIsInputFocused(true);
        props.onFocus?.(e);
      },
      [props],
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsInputFocused(false);
        props.onBlur?.(e);
      },
      [props],
    );

    const shake = useCallback(() => {
      "worklet";
      setHasError(true);
      shakeAnimation.value = withSequence(
        withTiming(SHAKE_DISTANCE, SHAKE_CONFIG),
        withTiming(-SHAKE_DISTANCE, SHAKE_CONFIG),
        withTiming(SHAKE_DISTANCE / 2, SHAKE_CONFIG),
        withTiming(-SHAKE_DISTANCE / 2, SHAKE_CONFIG),
        withTiming(0, SHAKE_CONFIG),
      );
    }, [shakeAnimation]);

    const focus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    const blur = useCallback(() => {
      inputRef.current?.blur();
    }, []);

    const clear = useCallback(() => {
      inputRef.current?.clear();
      setHasValue(false);
      props.onChangeText?.("");
    }, [props]);

    const clearError = useCallback(() => {
      setHasError(false);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        shake,
        focus,
        blur,
        clear,
        clearError,
      }),
      [shake, focus, blur, clear, clearError],
    );

    const currentPlaceholder = useMemo(
      () => (showPlaceholder ? placeholder : ""),
      [showPlaceholder, placeholder],
    );

    const labelClasses = useMemo(
      () => cn("text-muted-foreground", labelClassName),
      [labelClassName],
    );

    return (
      <View className={className}>
        <Animated.View style={animatedContainerStyle}>
          {label && (
            <Animated.View
              className="z-[1] absolute top-3 left-3"
              style={animatedLabelStyle}
              entering={FadeIn.duration(ANIMATION_DURATION)}
              pointerEvents="box-none"
            >
              <Label
                className={cn(
                  labelClasses,
                  hasError ? "text-red-700 dark:text-red-500" : "",
                )}
              >
                {label}
              </Label>
            </Animated.View>
          )}
          <Input
            {...props}
            ref={inputRef}
            placeholder={currentPlaceholder}
            className={cn(
              textInputClassName,
              hasError
                ? "border-2 dark:border rounded border-red-500 dark:border-red-500"
                : "",
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </Animated.View>
      </View>
    );
  },
);

AnimatedInput.displayName = "AnimatedInput";

export default React.memo(AnimatedInput);
