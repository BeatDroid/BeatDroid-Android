import { router } from "expo-router";
import React from "react";
import { View } from "react-native";

import { useTokenGenApi } from "@/api/generate-token/useTokenGenApi";
import { Text } from "@/components/ui/text";

interface SplashScreenProps {}

export default function SplashScreen({}: SplashScreenProps) {
  const genTokenApi = useTokenGenApi();

  React.useEffect(() => {
    if (genTokenApi.isSuccess) {
      router.replace("/welcome");
    }
  }, [genTokenApi.isSuccess, genTokenApi.data]);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg font-medium">Splash Screen (WIP)</Text>
    </View>
  );
}
