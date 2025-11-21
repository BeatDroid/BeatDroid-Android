import { Text } from "@/components/ui/text";
import { DialogConfig } from "@/contexts/dialog-context/dialog-types";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AnimatedButton } from "./animated-button";

interface GlobalDialogProps {
  dialog: DialogConfig | null;
  onDismiss: () => void;
}

export function GlobalDialog({ dialog, onDismiss }: GlobalDialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogConfig | null>(null);

  const backdropOpacity = useSharedValue(0);
  const dialogTranslateY = useSharedValue(100);
  const contentOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    if (dialog) {
      if (!isVisible) {
        setCurrentDialog(dialog);
        setIsVisible(true);

        backdropOpacity.value = withTiming(0.7, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });

        dialogTranslateY.value = withTiming(
          0,
          {
            duration: 400,
            easing: Easing.out(Easing.quad),
          },
          () => {
            contentOpacity.value = withTiming(1, { duration: 200 });
            iconRotation.value = withSequence(
              withTiming(-15, {
                duration: 80,
                easing: Easing.out(Easing.quad),
              }),
              withTiming(15, {
                duration: 80,
                easing: Easing.inOut(Easing.quad),
              }),
              withTiming(-15, {
                duration: 80,
                easing: Easing.inOut(Easing.quad),
              }),
              withTiming(15, {
                duration: 80,
                easing: Easing.inOut(Easing.quad),
              }),
              withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) }),
            );
          },
        );
      } else {
        contentOpacity.value = withTiming(0, { duration: 150 }, () => {
          runOnJS(setCurrentDialog)(dialog);
          contentOpacity.value = withTiming(1, { duration: 150 });
        });
      }
    } else if (isVisible) {
      contentOpacity.value = 0;
      backdropOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.quad),
      });

      dialogTranslateY.value = withTiming(
        100,
        {
          duration: 200,
          easing: Easing.in(Easing.quad),
        },
        () => {
          runOnJS(setIsVisible)(false);
          runOnJS(setCurrentDialog)(null);
        },
      );
    }
  }, [
    dialog,
    isVisible,
    backdropOpacity,
    dialogTranslateY,
    contentOpacity,
    iconRotation,
  ]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const dialogStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dialogTranslateY.value }],
    opacity: interpolate(
      dialogTranslateY.value,
      [0, 100],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  if (!isVisible || !currentDialog) {
    return null;
  }

  const handleDismiss = () => {
    if (currentDialog.dismissible !== false) {
      onDismiss();
    }
  };

  return (
    <>
      <Animated.View
        style={[backdropStyle]}
        className="absolute h-full w-full bg-gray-900"
      >
        <Pressable
          className="h-full w-full"
          onPress={handleDismiss}
          disabled={currentDialog.dismissible === false}
        />
      </Animated.View>

      <Animated.View
        style={dialogStyle}
        className="absolute top-[40%] self-center max-w-[85%] min-w-[75%] bg-background px-7 py-10 rounded-2xl items-center shadow-lg"
      >
        <Animated.View style={contentStyle} className="w-full items-center">
          {currentDialog.icon && (
            <Animated.View style={iconStyle}>
              {currentDialog.icon()}
            </Animated.View>
          )}

          {currentDialog.title && (
            <Text className="mt-5 text-2xl font-ui-bold text-center text-foreground">
              {currentDialog.title}
            </Text>
          )}

          {currentDialog.message && (
            <Text className="mt-2 text-base text-center text-foreground">
              {currentDialog.message}
            </Text>
          )}

          {currentDialog.content && currentDialog.content()}

          {currentDialog.actions && currentDialog.actions.length > 0 && (
            <View className="flex-row gap-3 mt-6 w-full">
              {currentDialog.actions.map((action, index) => (
                <AnimatedButton
                  key={index}
                  variant={action.variant || "default"}
                  onPress={action.onPress}
                  className={cn("flex-1", index === 0 && "mr-1")}
                >
                  <Text>{action.label}</Text>
                </AnimatedButton>
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </>
  );
}
