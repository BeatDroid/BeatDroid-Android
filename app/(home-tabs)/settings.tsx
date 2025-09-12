import AnimatedHeader from "@/components/ui-custom/animated-header";
import Background from "@/components/ui-custom/background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import useSupabase from "@/hooks/useSupabase";
import { useColorScheme } from "@/lib/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useCallback } from "react";
import { View } from "react-native";

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
      <AnimatedHeader
        title="Settings ⚙️"
        description={"Customize your experience"}
      />
      <Card className={"mt-3"}>
        <CardHeader>
          <Text className={"font-ui-bold"}>Theme</Text>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-between items-center">
            <Text className={"font-ui-regular"}>Colour Scheme</Text>
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
        </CardContent>
      </Card>
      <Card className={"mt-3"}>
        <CardHeader>
          <Text className={"font-ui-bold"}>Sync Options</Text>
        </CardHeader>
        <View className={"p-4"}>
          <View className="flex-row justify-between items-center">
            <Text className={"font-ui-regular"}>History Sync</Text>
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
