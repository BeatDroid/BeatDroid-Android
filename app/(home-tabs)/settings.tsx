import AnimatedHeader from "@/components/ui-custom/animated-header";
import Background from "@/components/ui-custom/background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import useSupabase from "@/hooks/useSupabase";
import { useColorScheme } from "@/hooks/useColorScheme";
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
    <Background disableSafeArea className={"pt-safe"}>
      <AnimatedHeader
        title="Settings ⚙️"
        description={"Customize your experience"}
      />
      <Card className={"mt-6"}>
        <CardHeader>
          <Text className={"font-ui-bold"}>Theme</Text>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-between items-center">
            <Text className={"font-ui-regular"}>Dark Mode</Text>
            <View className="flex-row items-center gap-3">
              <ExpoMaterialCommunityIcons
                className="text-foreground"
                size={23}
                name={"white-balance-sunny"}
              />
              <Switch
                checked={isDarkColorScheme}
                onCheckedChange={toggleColorScheme}
              />
              <ExpoMaterialCommunityIcons
                className="text-foreground"
                size={23}
                name={"moon-waning-crescent"}
              />
            </View>
          </View>
        </CardContent>
      </Card>
      <Card className={"mt-3"}>
        <CardHeader>
          <Text className={"font-ui-bold"}>Sync Options</Text>
        </CardHeader>
        <CardContent>
          <View className="flex-row justify-between items-center">
            <Text className={"font-ui-regular"}>History Sync</Text>
            {isLoggedIn ? (
              <Button
                variant="default"
                disabled={loading}
                onPress={supabaseLogout}
                className={"rounded-full"}
              >
                <Text>Logout</Text>
              </Button>
            ) : (
              <Button
                variant="default"
                disabled={loading}
                onPress={supabaseLogin}
                className="flex-row items-center gap-2 rounded-full"
              >
                <ExpoMaterialCommunityIcons
                  className="text-black"
                  size={15}
                  name={"google"}
                />
                <Text>Login</Text>
              </Button>
            )}
          </View>
        </CardContent>
      </Card>
    </Background>
  );
};

export default Settings;
