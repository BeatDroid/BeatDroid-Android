import "~/global.css";
import { ErrorBoundary } from "@/components/error-boundary";
import queryClient from "@/config/queryClient";
import { DialogProvider } from "@/contexts/dialog-context/dialog-context";
import { NetworkProvider } from "@/contexts/network-context";
import { StartupProvider } from "@/contexts/startup-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import useSupabase from "@/hooks/useSupabase";
import { NAV_THEME } from "@/lib/theme";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import * as SystemUI from "expo-system-ui";
import * as React from "react";
import { useEffect } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";
import { themes } from "~/lib/constants";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 1,
    profilesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      navigationIntegration,
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
      Sentry.hermesProfilingIntegration({
        platformProfilers: false,
      }),
    ],
  });
}

SplashScreen.preventAutoHideAsync();

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export default Sentry.wrap(function RootLayout() {
  const ref = useNavigationContainerRef();
  React.useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return <ProviderStack />;
});

function ProviderStack() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      isDarkColorScheme ? themes.Dark.bg : themes.Light.bg,
    );
  }, [isDarkColorScheme]);

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
              <QueryClientProvider client={queryClient}>
                <StartupProvider>
                  <DialogProvider>
                    <NetworkProvider>
                      <ThemeProvider
                        value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}
                      >
                        <SystemBars style="auto" />
                        <NavigationStack />
                        <PortalHost />
                        <Toaster
                          theme="system"
                          richColors
                          position="bottom-center"
                          autoWiggleOnUpdate="toast-change"
                          duration={7000}
                          offset={130}
                          closeButton={true}
                          toastOptions={{
                            style: {
                              borderWidth: 3,
                              borderRadius: 7,
                            },
                          }}
                        />
                      </ThemeProvider>
                    </NetworkProvider>
                  </DialogProvider>
                </StartupProvider>
              </QueryClientProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </SQLiteProvider>
    </React.Suspense>
  );
}

function NavigationStack() {
  const { supabaseLoginCheck, syncFromSupabase } = useSupabase();

  React.useEffect(() => {
    supabaseLoginCheck().then((loggedIn) => {
      if (loggedIn) syncFromSupabase();
    });
  }, [supabaseLoginCheck, syncFromSupabase]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(home-tabs)" />
      <Stack.Screen name="poster-view" />
      <Stack.Screen name="lyric-selection" />
    </Stack>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
