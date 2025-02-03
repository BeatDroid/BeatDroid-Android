import Background from "@/components/Background";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, MD3Theme, useTheme } from "react-native-paper";
import Animated from "react-native-reanimated";

export default function SplashScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Background style={styles.container}>
      <View style={styles.titleLayout}>
        <Animated.Text style={styles.title}>BeatDroid 🎷</Animated.Text>
        <Text style={styles.subtitle}>
          Create eye-catching, Pinterest-style music posters effortlessly on
          Android! 🍀
        </Text>
      </View>
      <View style={styles.centreLayout}>
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
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Start</Text>
          <Text style={styles.sectionText}>• Connect your Spotify account</Text>
          <Text style={styles.sectionText}>• Choose a track or album</Text>
          <Text style={styles.sectionText}>
            • Customize your poster and save it!
          </Text>
        </Card>
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
      </View>
      <View>
        <Button
          mode="contained"
          onPress={() => router.push("/result")}
          icon={{ source: "arrow-right", direction: "auto" }}
        >
          Lets Go
        </Button>
      </View>
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
  });
