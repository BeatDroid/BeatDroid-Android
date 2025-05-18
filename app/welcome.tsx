import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedHeader from "@/components/ui-custom/animated-header";
import Background from "@/components/ui-custom/background";
import InfoCard from "@/components/ui-custom/info-card";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const duration = 1000;
const offset = 100;

export default function Welcome() {
  const [enableButton, setEnableButton] = useState(false);
  const featureBox1Position = useSharedValue(-offset);
  const featureBox2Position = useSharedValue(-offset);
  const featureBox3Position = useSharedValue(-offset);

  useEffect(() => {
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
            setEnableButton(true);
          }, duration);
        }, duration / 3);
      }, duration / 3);
    }, duration);

    return () => {
      setEnableButton(false);
      featureBox1Position.value = -offset;
      featureBox2Position.value = -offset;
      featureBox3Position.value = -offset;
    };
  }, [featureBox1Position, featureBox2Position, featureBox3Position]);

  const animatedFeatureBox1Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: featureBox1Position.value }],
      opacity: interpolate(featureBox1Position.value, [-offset, 0], [0, 1]),
    };
  });

  const animatedFeatureBox2Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: featureBox2Position.value }],
      opacity: interpolate(featureBox2Position.value, [-offset, 0], [0, 1]),
    };
  });

  const animatedFeatureBox3Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: featureBox3Position.value }],
      opacity: interpolate(featureBox3Position.value, [-offset, 0], [0, 1]),
    };
  });

  return (
    <Background>
      <AnimatedHeader
        offset={100}
        duration={1000}
        title="BeatDroid 🎷"
        description="Create eye-catching, Pinterest-style music posters effortlessly on Android! 🍀"
      />
      <View className="flex-[6] items-center justify-center">
        <Animated.View
          className={"w-full mb-6"}
          style={animatedFeatureBox1Style}
        >
          <InfoCard
            title="✨ Features"
            highlights={[
              "Seamless integration with Spotify",
              "Customizable themes and layouts",
              "Offline mode for creating posters anywhere",
            ]}
          />
        </Animated.View>

        <Animated.View
          className={"w-full mb-6"}
          style={animatedFeatureBox2Style}
        >
          <InfoCard
            title="🚀 Quick Start"
            highlights={[
              "Connect your Spotify account",
              "Choose a track or album",
              "Customize your poster and save it!",
            ]}
          />
        </Animated.View>

        <Animated.View
          className={"w-full mb-6"}
          style={animatedFeatureBox3Style}
        >
          <InfoCard
            title="🖼️ Save & Share"
            highlights={[
              "Download posters to your device",
              "Print out your favorite designs",
              "Frame and display your music art",
            ]}
          />
        </Animated.View>
      </View>
      <AnimatedConfirmButton
        title="Let's Go"
        onPress={() => router.push("/search")}
        disabled={!enableButton}
      />
    </Background>
  );
}
Welcome.displayName = "Welcome";
