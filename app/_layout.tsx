import "~/global.css";

import { ErrorBoundary } from "@/components/error-boundary";
import queryClient from "@/config/queryClient";
import { AuthProvider } from "@/contexts/auth-context";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as React from "react";
import { Platform } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import * as SystemUI from 'expo-system-ui';

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

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    SystemUI.setBackgroundColorAsync("#fcfbf7")
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView>
        <AuthProvider>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <QueryClientProvider client={queryClient}>
              <SystemBars style={isDarkColorScheme ? "light" : "dark"} />
              <NavigationStack />
              <PortalHost />
            </QueryClientProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster
          richColors
          position="bottom-center"
          autoWiggleOnUpdate="toast-change"
        />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function NavigationStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="[posterPath]" options={{ headerShown: false }} />
    </Stack>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
