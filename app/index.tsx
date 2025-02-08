import { Background, WelcomeCards } from "@/components";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, MD3Theme, useTheme } from "react-native-paper";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const duration = 1000;
const offset = 100;

export default function WelcomeScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const headerPosition = useSharedValue(-offset);
  const footerPosition = useSharedValue(offset);
  const featureBox1Position = useSharedValue(-offset);
  const featureBox2Position = useSharedValue(-offset);
  const featureBox3Position = useSharedValue(-offset);

  useEffect(() => {
    // Start header and footer animations immediately
    headerPosition.value = withTiming(0, { duration });

    // Start feature box animations after header/footer complete
    setTimeout(() => {
      featureBox1Position.value = withTiming(0, { duration });

      // Start second feature box after first completes
      setTimeout(() => {
        featureBox2Position.value = withTiming(0, { duration });

        // Start third feature box after second completes
        setTimeout(() => {
          featureBox3Position.value = withTiming(0, { duration });

          // Start footer animation after third completes
          setTimeout(() => {
            footerPosition.value = withTiming(0, { duration });
          }, duration * 1.5);
        }, duration / 3);
      }, duration / 3);
    }, duration);

    return () => {
      headerPosition.value = -offset;
      footerPosition.value = offset;
      featureBox1Position.value = -offset;
      featureBox2Position.value = -offset;
      featureBox3Position.value = -offset;
    };
  }, [
    featureBox1Position,
    featureBox2Position,
    featureBox3Position,
    footerPosition,
    headerPosition,
  ]);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerPosition.value }],
      opacity: interpolate(headerPosition.value, [-offset, 0], [0, 1]),
    };
  });

  const animatedFooterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: footerPosition.value }],
      opacity: interpolate(footerPosition.value, [offset, 0], [0, 1]),
    };
  });

  const animatedFeatureBox1Style = useAnimatedStyle(() => {
    return {
      ...styles.fullWidth,
      transform: [{ translateX: featureBox1Position.value }],
      opacity: interpolate(featureBox1Position.value, [-offset, 0], [0, 1]),
    };
  });

  const animatedFeatureBox2Style = useAnimatedStyle(() => {
    return {
      ...styles.fullWidth,
      transform: [{ translateX: featureBox2Position.value }],
      opacity: interpolate(featureBox2Position.value, [-offset, 0], [0, 1]),
    };
  });

  const animatedFeatureBox3Style = useAnimatedStyle(() => {
    return {
      ...styles.fullWidth,
      transform: [{ translateX: featureBox3Position.value }],
      opacity: interpolate(featureBox3Position.value, [-offset, 0], [0, 1]),
    };
  });

  return (
    <Background>
      <Animated.View
        style={animatedHeaderStyle}
        className="flex-1 items-center justify-center"
      >
        <Animated.Text
          style={styles.title}
          className="text-2xl font-bold mb-3 text-center"
        >
          BeatDroid 🎷
        </Animated.Text>
        <Text style={styles.subtitle} className="text-base text-center">
          Create eye-catching, Pinterest-style music posters effortlessly on
          Android! 🍀
        </Text>
      </Animated.View>
      <View className="flex-[6] items-center justify-center">
        <Animated.View style={animatedFeatureBox1Style}>
          <WelcomeCards
            title="✨ Features"
            highlights={[
              "Seamless integration with Spotify",
              "Customizable themes and layouts",
              "Offline mode for creating posters anywhere",
            ]}
          />
        </Animated.View>

        <Animated.View style={animatedFeatureBox2Style}>
          <WelcomeCards
            title="🚀 Quick Start"
            highlights={[
              "Connect your Spotify account",
              "Choose a track or album",
              "Customize your poster and save it!",
            ]}
          />
        </Animated.View>

        <Animated.View style={animatedFeatureBox3Style}>
          <WelcomeCards
            title="🖼️ Save & Share"
            highlights={[
              "Download posters to your device",
              "Print out your favorite designs",
              "Frame and display your music art",
            ]}
          />
        </Animated.View>
      </View>
      <Animated.View style={animatedFooterStyle} className="mt-4">
        <Button
          mode="contained"
          onPress={() => router.push("/result")}
          icon={{ source: "arrow-right", direction: "auto" }}
        >
          Lets Go
        </Button>
      </Animated.View>
    </Background>
  );
}

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    title: {
      color: theme.colors.primary,
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
    },
    section: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    sectionTitle: {
      color: theme.colors.primary,
    },
    sectionText: {
      color: theme.colors.onSurface,
    },
    fullWidth: {
      width: "100%",
    },
  });
