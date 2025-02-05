import Background from "@/components/Background";
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

export default function SplashScreen() {
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
    footerPosition.value = withTiming(0, { duration });

    // Start feature box animations after header/footer complete
    setTimeout(() => {
      featureBox1Position.value = withTiming(0, { duration });

      // Start second feature box after first completes
      setTimeout(() => {
        featureBox2Position.value = withTiming(0, { duration });

        // Start third feature box after second completes
        setTimeout(() => {
          featureBox3Position.value = withTiming(0, { duration });
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
  }, []);

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
    <Background style={styles.container}>
      <Animated.View style={[styles.titleLayout, animatedHeaderStyle]}>
        <Animated.Text style={styles.title}>BeatDroid 🎷</Animated.Text>
        <Text style={styles.subtitle}>
          Create eye-catching, Pinterest-style music posters effortlessly on
          Android! 🍀
        </Text>
      </Animated.View>
      <View style={styles.centreLayout}>
        <Animated.View style={animatedFeatureBox1Style}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Features</Text>
            <Text style={styles.sectionText}>
              • Seamless integration with Spotify
            </Text>
            <Text style={styles.sectionText}>
              • Customizable themes and layouts
            </Text>
            <Text style={styles.sectionText}>
              • Offline mode for creating posters anywhere
            </Text>
          </Card>
        </Animated.View>

        <Animated.View style={animatedFeatureBox2Style}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Quick Start</Text>
            <Text style={styles.sectionText}>
              • Connect your Spotify account
            </Text>
            <Text style={styles.sectionText}>• Choose a track or album</Text>
            <Text style={styles.sectionText}>
              • Customize your poster and save it!
            </Text>
          </Card>
        </Animated.View>

        <Animated.View style={animatedFeatureBox3Style}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🖼️ Save & Share</Text>
            <Text style={styles.sectionText}>
              • Download posters to your device
            </Text>
            <Text style={styles.sectionText}>
              • Print out your favorite designs
            </Text>
            <Text style={styles.sectionText}>
              • Frame and display your music art
            </Text>
          </Card>
        </Animated.View>
      </View>
      <Animated.View style={animatedFooterStyle}>
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
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#ffffff",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginBottom: 12,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
    section: {
      width: "100%",
      marginBottom: 24,
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.primary,
      marginBottom: 12,
    },
    sectionText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginBottom: 8,
      lineHeight: 20,
    },
    titleLayout: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    centreLayout: {
      flex: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    fullWidth: {
      width: "100%",
    },
  });
