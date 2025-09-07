// Migrated from app.json to app.config.js to allow inline comments and clearer asset documentation.
module.exports = {
  expo: {
    name: "BeatDroid",
    slug: "BeatDroid",
    version: "1.0.0",
    orientation: "portrait",

    // Asset: Base app icon (used across platforms unless overridden)
    icon: "./assets/images/icon.png",

    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dhanush911.BeatDroid",
    },

    android: {
      // Asset: Android application icon
      icon: "./assets/images/icon.png",

      adaptiveIcon: {
        // Asset: Adaptive icon foreground layer (transparent background)
        foregroundImage: "./assets/images/adaptive-icon.png",
        // Asset: Adaptive monochrome icon (for themed icons)
        monochromeImage: "./assets/images/adaptive-monochrome.png",
        backgroundColor: "#ec8407",
      },
      package: "com.dhanush911.BeatDroid",
    },

    web: {
      bundler: "metro",
      output: "static",
      // Asset: Web favicon
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",

      [
        "expo-splash-screen",
        {
          // Asset: Splash screen image (light mode)
          image: "./assets/images/splash-icon.png",
          dark: {
            // Asset: Splash screen image (dark mode)
            image: "./assets/images/splash-icon.png",
            backgroundColor: "#ec8407",
          },
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ec8407",
        },
      ],

      [
        "react-native-edge-to-edge",
        {
          android: {
            parentTheme: "Theme.EdgeToEdge.Material3.Dynamic",
            enforceNavigationBarContrast: false,
          },
        },
      ],

      [
        "expo-font",
        {
          // Assets: Bundled font files (all platforms)
          fonts: [
            // PlusJakartaSans font files
            "./assets/fonts/PlusJakartaSans-ExtraLight.ttf",
            "./assets/fonts/PlusJakartaSans-ExtraLightItalic.ttf",
            "./assets/fonts/PlusJakartaSans-Light.ttf",
            "./assets/fonts/PlusJakartaSans-LightItalic.ttf",
            "./assets/fonts/PlusJakartaSans-Regular.ttf",
            "./assets/fonts/PlusJakartaSans-Italic.ttf",
            "./assets/fonts/PlusJakartaSans-Medium.ttf",
            "./assets/fonts/PlusJakartaSans-MediumItalic.ttf",
            "./assets/fonts/PlusJakartaSans-SemiBold.ttf",
            "./assets/fonts/PlusJakartaSans-SemiBoldItalic.ttf",
            "./assets/fonts/PlusJakartaSans-Bold.ttf",
            "./assets/fonts/PlusJakartaSans-BoldItalic.ttf",
            "./assets/fonts/PlusJakartaSans-ExtraBold.ttf",
            "./assets/fonts/PlusJakartaSans-ExtraBoldItalic.ttf",
          ],

          // Android-specific font family/weight mappings
          android: {
            fonts: [
              {
                fontFamily: "PlusJakartaSans",
                fontDefinitions: [
                  {
                    path: "./assets/fonts/PlusJakartaSans-ExtraLight.ttf",
                    weight: 200,
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-ExtraLightItalic.ttf",
                    weight: 200,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-Light.ttf",
                    weight: 300,
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-LightItalic.ttf",
                    weight: 300,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-Regular.ttf",
                    weight: 400,
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-Italic.ttf",
                    weight: 400,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-Medium.ttf",
                    weight: 500,
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-MediumItalic.ttf",
                    weight: 500,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-SemiBold.ttf",
                    weight: 600,
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-SemiBoldItalic.ttf",
                    weight: 600,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-Bold.ttf",
                    weight: 700,
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-BoldItalic.ttf",
                    weight: 700,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-ExtraBold.ttf",
                    weight: 800,
                  },
                  {
                    path: "./assets/fonts/PlusJakartaSans-ExtraBoldItalic.ttf",
                    weight: 800,
                    style: "italic",
                  },
                ],
              },
            ],
          },
        },
      ],

      "expo-web-browser",
      "expo-sqlite",

      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "beatdroid",
        },
      ],

      "@react-native-google-signin/google-signin",
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: { origin: false },
      eas: {
        projectId: "c252dbd9-7eb4-4696-babc-0350a3325875",
      },
    },

    runtimeVersion: { policy: "appVersion" },

    updates: {
      url: "https://u.expo.dev/c252dbd9-7eb4-4696-babc-0350a3325875",
    },
  },
};
