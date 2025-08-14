import "~/global.css";

import { useTokenGenApi } from "@/api/generate-token/useTokenGenApi";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import queryClient from "@/config/queryClient";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { DialogProvider } from "@/contexts/dialog-context/dialog-context";
import { NetworkProvider } from "@/contexts/network-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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
import { useRef } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { toast, Toaster } from "sonner-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

if (!__DEV__) {
  Sentry.init({
    dsn: "https://9fdfe8adf7d5878863ddfb6c6c9d8307@o4509837047037952.ingest.de.sentry.io/4509837060341840",
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

  // I dont want your ip address
  Sentry.setUser({ ip_address: "0.0.0.0" });
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
                <DialogProvider>
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
                </DialogProvider>
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
  const id = useRef<string | number>("");

  React.useEffect(() => {
    id.current = toast.loading("Fetching token.", {
      duration: 1000,
    });
  }, []);

  React.useEffect(() => {
    const setTokenAsync = async () => {
      if (genTokenApi.isSuccess && genTokenApi.data.success) {
        setToken(genTokenApi.data.data!.access_token);
        toast.success("App initialized successfully", {
          id: id.current,
          description: "Enjoy your posters!",
          duration: 2000,
        });
      } else if (genTokenApi.isError) {
        toast.error("Cannot initialize app", {
          id: id.current,
          description:
            genTokenApi.error?.message + "\nRestart app to try again",
          duration: Infinity,
          dismissible: __DEV__,
          action: (
            <Button
              size="sm"
              variant="outline"
              onPress={() => {
                toast.dismiss(id.current);
                genTokenApi.refetch();
              }}
              className="flex-row items-center gap-3"
            >
              <Text>Try again</Text>
              <FontAwesome name="repeat" size={16} color="white" />
            </Button>
          ),
        });
        toast.wiggle(id.current);
      }
    };

    setTokenAsync();
  }, [genTokenApi, setToken]);

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
