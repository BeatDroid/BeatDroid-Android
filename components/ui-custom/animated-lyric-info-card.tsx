import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { lyricsRegex } from "@/utils/text-utls";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, type TextInput, useWindowDimensions, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Animation timing constants
const ANIMATION_TIMINGS = {
  FADE_OUT_FAST: 150,
  FADE_IN: 200,
  DIMENSIONS: 300,
  TRANSLATE_Y: 400,
  INPUT_FOCUS_DELAY: 200,
  INPUT_NAVIGATION_DELAY: 100,
} as const;

interface AnimatedLyricInfoCardProps {
  disabled: boolean;
  selectedIndices: { start: number; end: number } | null;
  buttonLabel: string;
  onPress: () => void;
  onCustomLyricsSet: ({
    hasCustomLyrics,
    lyrics,
  }: {
    hasCustomLyrics: boolean;
    lyrics: string;
  }) => void;
}

const AnimatedLyricInfoCard = React.memo<AnimatedLyricInfoCardProps>(
  ({ disabled, selectedIndices, buttonLabel, onPress, onCustomLyricsSet }) => {
    const { height } = useWindowDimensions();
    const { height: keyboardHeight, progress } =
      useReanimatedKeyboardAnimation();
    const inputRef1 = useRef<TextInput>(null);
    const inputRef2 = useRef<TextInput>(null);
    const inputRef3 = useRef<TextInput>(null);
    const inputRef4 = useRef<TextInput>(null);
    const translateY = useSharedValue(0);
    const dimensions = useSharedValue({ left: 8, right: 8 });
    const opacity = useSharedValue(1);
    const [customLyricsMode, setCustomLyricsMode] = useState(false);
    const [customLyricsEnabled, setCustomLyricsEnabled] = useState(false);
    const [showContent, setShowContent] = useState(true);
    const [customLyrics, setCustomLyrics] = useState<
      { id: number; lyric: string }[]
    >([
      { id: 0, lyric: "" },
      { id: 1, lyric: "" },
      { id: 2, lyric: "" },
      { id: 3, lyric: "" },
    ]);

    useEffect(() => {
      if (!selectedIndices) {
        const allFilled = customLyrics.every((lyric) => lyric.lyric.length > 0);
        setCustomLyricsMode(allFilled);
        if (allFilled) {
          const lyrics = customLyrics.map((lyric) => lyric.lyric.trim());
          onCustomLyricsSet({
            hasCustomLyrics: true,
            lyrics: lyrics.join("\n"),
          });
        } else {
          onCustomLyricsSet({ hasCustomLyrics: false, lyrics: "" });
        }
      } else {
        setCustomLyricsMode(false);
      }
    }, [customLyrics, onCustomLyricsSet, selectedIndices]);

    useEffect(() => {
      if (customLyricsEnabled) {
        opacity.value = withTiming(
          0,
          {
            duration: ANIMATION_TIMINGS.FADE_OUT_FAST,
            easing: Easing.inOut(Easing.ease),
          },
          (finished) => {
            "worklet";
            if (finished) {
              runOnJS(setShowContent)(false);
              // Chain opacity fade-in after content switch
              opacity.value = withTiming(1, {
                duration: ANIMATION_TIMINGS.FADE_IN,
                easing: Easing.inOut(Easing.ease),
              });
            }
          },
        );

        dimensions.value = withTiming(
          { left: 0, right: 0 },
          {
            duration: ANIMATION_TIMINGS.DIMENSIONS,
            easing: Easing.inOut(Easing.ease),
          },
        );
        translateY.value = withTiming(-height / 2 + 300, {
          duration: ANIMATION_TIMINGS.TRANSLATE_Y,
          easing: Easing.elastic(),
        });
      } else {
        opacity.value = withTiming(
          0,
          {
            duration: ANIMATION_TIMINGS.FADE_IN,
            easing: Easing.inOut(Easing.ease),
          },
          (finished) => {
            "worklet";
            if (finished) {
              runOnJS(setShowContent)(true);
              // Chain opacity fade-in after content switch
              opacity.value = withTiming(1, {
                duration: ANIMATION_TIMINGS.FADE_IN,
                easing: Easing.inOut(Easing.ease),
              });
            }
          },
        );

        dimensions.value = withTiming(
          { left: 16, right: 16 },
          {
            duration: ANIMATION_TIMINGS.DIMENSIONS,
            easing: Easing.inOut(Easing.ease),
          },
        );
        translateY.value = withTiming(0, {
          duration: ANIMATION_TIMINGS.TRANSLATE_Y,
          easing: Easing.elastic(),
        });
      }
    }, [customLyricsEnabled, height]);

    const animatedContainerStyle = useAnimatedStyle(() => {
      // When keyboard is open and custom lyrics are enabled, move card up
      const keyboardOffset = progress.value > 0 ? keyboardHeight.value : 0;

      return {
        left: dimensions.value.left,
        right: dimensions.value.right,
        transform: [{ translateY: translateY.value + keyboardOffset / 3 }],
      };
    });

    const animatedContentStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const handleCustomLyricsChange = useCallback(
      ({ id, lyrics }: { id: number; lyrics: string }) => {
        setCustomLyrics((prev) => {
          const newLyrics = [...prev];
          newLyrics[id] = { id, lyric: lyrics };
          return newLyrics;
        });
      },
      [],
    );

    const toggleCustomLyrics = useCallback(() => {
      setCustomLyricsEnabled((prev) => {
        const newValue = !prev;
        setTimeout(() => {
          if (
            inputRef1.current &&
            inputRef2.current &&
            inputRef3.current &&
            inputRef4.current
          ) {
            if (newValue) {
              inputRef1.current?.focus();
            } else {
              inputRef1.current?.blur();
              inputRef2.current?.blur();
              inputRef3.current?.blur();
              inputRef4.current?.blur();
            }
          }
        }, ANIMATION_TIMINGS.INPUT_FOCUS_DELAY);
        return newValue;
      });
    }, []);

    const focusNextInput = useCallback((currentInput: number) => {
      setTimeout(() => {
        switch (currentInput) {
          case 1:
            inputRef2.current?.focus();
            break;
          case 2:
            inputRef3.current?.focus();
            break;
          case 3:
            inputRef4.current?.focus();
            break;
          case 4:
            inputRef4.current?.blur();
            break;
        }
      }, ANIMATION_TIMINGS.INPUT_NAVIGATION_DELAY);
    }, []);

    const handleInput1Change = useCallback(
      (lyrics: string) => {
        if (lyrics.length > 0 && !lyricsRegex.test(lyrics)) {
          return;
        }
        handleCustomLyricsChange({ id: 0, lyrics });
      },
      [handleCustomLyricsChange],
    );

    const handleInput2Change = useCallback(
      (lyrics: string) => {
        if (lyrics.length > 0 && !lyricsRegex.test(lyrics)) {
          return;
        }
        handleCustomLyricsChange({ id: 1, lyrics });
      },
      [handleCustomLyricsChange],
    );

    const handleInput3Change = useCallback(
      (lyrics: string) => {
        if (lyrics.length > 0 && !lyricsRegex.test(lyrics)) {
          return;
        }
        handleCustomLyricsChange({ id: 2, lyrics });
      },
      [handleCustomLyricsChange],
    );

    const handleInput4Change = useCallback(
      (lyrics: string) => {
        if (lyrics.length > 0 && !lyricsRegex.test(lyrics)) {
          return;
        }
        handleCustomLyricsChange({ id: 3, lyrics });
      },
      [handleCustomLyricsChange],
    );

    const handleSubmitInput1 = useCallback(() => {
      focusNextInput(1);
    }, [focusNextInput]);

    const handleSubmitInput2 = useCallback(() => {
      focusNextInput(2);
    }, [focusNextInput]);

    const handleSubmitInput3 = useCallback(() => {
      focusNextInput(3);
    }, [focusNextInput]);

    const handleSubmitInput4 = useCallback(() => {
      focusNextInput(4);
    }, [focusNextInput]);

    const selectedIndicesText = useMemo(
      () =>
        customLyricsMode
          ? "Custom Lyrics"
          : selectedIndices
            ? `Lines ${selectedIndices.start}-${selectedIndices.end}`
            : "No selection",
      [customLyricsMode, selectedIndices],
    );

    return (
      <Animated.View
        style={animatedContainerStyle}
        className="absolute bottom-safe-offset-5 rounded-3xl bg-black/95 border-2 border-primary/20"
      >
        <Animated.View style={animatedContentStyle}>
          {showContent ? (
            <View className="pt-6 pb-6 px-6">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-muted-foreground text-xs font-ui-regular">
                    Selected Lines
                  </Text>
                  <Text
                    className={cn(
                      customLyricsMode
                        ? "text-secondary-foreground"
                        : "text-foreground",
                      "text-2xl font-ui-bold",
                    )}
                  >
                    {selectedIndicesText}
                  </Text>
                </View>
                <Button
                  variant={"ghost"}
                  className="bg-primary/20 px-4 py-2 rounded-full"
                  onPress={selectedIndices ? undefined : toggleCustomLyrics}
                  disabled={!!selectedIndices}
                >
                  <Text className="text-primary text-sm font-ui-semibold">
                    {selectedIndices ? "✓ Ready" : "Custom"}
                  </Text>
                </Button>
              </View>

              <Button
                className="w-full rounded-xl"
                disabled={disabled}
                onPress={onPress}
              >
                <Text className="font-ui-semibold text-base">
                  {buttonLabel || "Generate Poster"}
                </Text>
              </Button>
            </View>
          ) : (
            <View className="pt-8 pb-8 px-8">
              <View className="items-center justify-center mb-4">
                <Text className="text-primary text-3xl font-ui-bold mb-2">
                  Custom Lyrics
                </Text>
                <Text className="text-muted-foreground text-sm font-ui-regular text-center">
                  Create your own lyrics!
                </Text>
              </View>

              <View className="bg-primary/10 rounded-md border-2 border-primary/30 mb-4">
                {/* Input field for line 1 */}
                <Input
                  ref={inputRef1}
                  placeholder="First Verse"
                  className="font-ui-thin border-t-1 border-y-1 border-b-0 rounded-b-none border-primary/30"
                  autoCapitalize={"none"}
                  numberOfLines={1}
                  value={customLyrics[0].lyric}
                  onChangeText={handleInput1Change}
                  onSubmitEditing={handleSubmitInput1}
                  returnKeyType="next"
                />
                {/* Input field for line 2 */}
                <Input
                  ref={inputRef2}
                  placeholder="Second Verse"
                  className="font-ui-thin border-x-1 border-t-0 border-b-0 rounded-none border-primary/30"
                  autoCapitalize={"none"}
                  numberOfLines={1}
                  value={customLyrics[1].lyric}
                  onChangeText={handleInput2Change}
                  onSubmitEditing={handleSubmitInput2}
                  returnKeyType="next"
                />
                {/* Input field for line 3 */}
                <Input
                  ref={inputRef3}
                  placeholder="Third Verse"
                  className="font-ui-thin border-x-1 border-t-0 border-b-0 rounded-none border-primary/30"
                  autoCapitalize={"none"}
                  numberOfLines={1}
                  value={customLyrics[2].lyric}
                  onChangeText={handleInput3Change}
                  onSubmitEditing={handleSubmitInput3}
                  returnKeyType="next"
                />
                {/* Input field for line 4 */}
                <Input
                  ref={inputRef4}
                  placeholder="Fourth Verse"
                  className="font-ui-thin border-t-0 border-b-1 border-x-1 rounded-t-none border-primary/30"
                  autoCapitalize={"none"}
                  numberOfLines={1}
                  value={customLyrics[3].lyric}
                  onChangeText={handleInput4Change}
                  onSubmitEditing={handleSubmitInput4}
                  returnKeyType="done"
                />
              </View>
              <Button
                variant={"ghost"}
                className="bg-primary px-6"
                onPress={toggleCustomLyrics}
              >
                <Text className="text-primary-foreground text-base font-ui-semibold">
                  Back to Selection
                </Text>
              </Button>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    );
  },
);

AnimatedLyricInfoCard.displayName = "AnimatedLyricInfoCard";

export default AnimatedLyricInfoCard;
