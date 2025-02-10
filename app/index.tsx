import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function SplashScreen() {
  React.useEffect(() => {
    setTimeout(() => {
      router.replace("/welcome");
    }, 500);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Splash Screen (WIP)</Text>
    </View>
  );
}
