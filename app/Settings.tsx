import React, { useCallback } from "react";
import Background from "@/components/ui-custom/background";
import AnimatedHeader from "@/components/ui-custom/animated-header";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { cssInterop } from "nativewind";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useColorScheme } from "@/lib/useColorScheme";
import { View } from "react-native";
import useSupabase from "@/hooks/useSupabase";
import { useFocusEffect } from "expo-router";

const ExpoMaterialCommunityIcons = cssInterop(MaterialCommunityIcons, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

const Settings = () => {
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const {
    loading,
    isLoggedIn,
    supabaseLogin,
    supabaseLoginCheck,
    supabaseLogout,
  } = useSupabase();

  useFocusEffect(
    useCallback(() => {
      supabaseLoginCheck();
    }, [supabaseLoginCheck]),
  );

  return (
    <Background>
      <AnimatedHeader duration={500} offset={50} title="Settings ⚙️" />
      <Card>
        <View className={"p-4"}>
          <View className="flex-row justify-between items-center">
            <Text className={"font-ui-bold"}>Theme</Text>
            <Button variant="ghost" onPress={toggleColorScheme}>
              <ExpoMaterialCommunityIcons
                className="text-foreground"
                size={23}
                name={
                  isDarkColorScheme()
                    ? "white-balance-sunny"
                    : "moon-waning-crescent"
                }
              />
            </Button>
          </View>
        </View>
        <View className={"p-4"}>
          <View className="flex-row justify-between items-center">
            <Text className={"font-ui-bold"}>History Sync</Text>
            {isLoggedIn ? (
              <Button
                variant="default"
                disabled={loading}
                onPress={supabaseLogout}
              >
                <Text>Logout</Text>
              </Button>
            ) : (
              <Button
                variant="default"
                disabled={loading}
                onPress={supabaseLogin}
              >
                <Text>Login</Text>
              </Button>
            )}
          </View>
        </View>
      </Card>
    </Background>
  );
};

export default Settings;
