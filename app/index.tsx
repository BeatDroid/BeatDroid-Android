import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";

interface SplashScreenProps {}

export default function SplashScreen({}: SplashScreenProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg font-medium">Splash Screen (WIP)</Text>
    </View>
  );
}
