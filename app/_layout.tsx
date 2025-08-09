import "~/global.css";

import { useTokenGenApi } from "@/api/generate-token/useTokenGenApi";
import { ErrorBoundary } from "@/components/error-boundary";
import NetworkOverlay from "@/components/ui-custom/network-overlay";
import queryClient from "@/config/queryClient";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { NetworkProvider } from "@/contexts/network-context";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import * as SystemUI from "expo-system-ui";
import * as React from "react";
import { ActivityIndicator, Platform } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

SplashScreen.preventAutoHideAsync();

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export default function RootLayout() {
  return <ProviderStack />;
}

function ProviderStack() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  SystemUI.setBackgroundColorAsync(
    isDarkColorScheme() ? NAV_THEME.dark.background : NAV_THEME.light.background
  );

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <React.Suspense fallback={<ActivityIndicator size="large" color="white" />}>
      <SQLiteProvider databaseName="db.db" useSuspense>
        <ErrorBoundary>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <AuthProvider>
                <NetworkProvider>
                  <QueryClientProvider client={queryClient}>
                    <ThemeProvider
                      value={isDarkColorScheme() ? DARK_THEME : LIGHT_THEME}
                    >
                      <SystemBars
                        style={isDarkColorScheme() ? "light" : "dark"}
                      />
                      <NavigationStack />
                      <PortalHost />
                      <NetworkOverlay />
                      <Toaster
                        richColors
                        position="bottom-center"
                        autoWiggleOnUpdate="toast-change"
                        duration={7000}
                        offset={30}
                        closeButton={true}
                        toastOptions={{
                          style: {
                            borderWidth: 3,
                            borderRadius: 7,
                          },
                        }}
                      />
                    </ThemeProvider>
                  </QueryClientProvider>
                </NetworkProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </SQLiteProvider>
    </React.Suspense>
  );
}

function NavigationStack() {
  const genTokenApi = useTokenGenApi();
  const { setToken } = useAuth();

  React.useEffect(() => {
    const setTokenAsync = async () => {
      if (genTokenApi.isSuccess && genTokenApi.data.success) {
        setToken(genTokenApi.data.data!.access_token);
      }
    };

    setTokenAsync();
  }, [genTokenApi.isSuccess, genTokenApi.data, setToken]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="search-history" />
      <Stack.Screen name="poster-view" />
    </Stack>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
