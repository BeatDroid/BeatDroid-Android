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
            "./assets/fonts/Montserrat-Bold.ttf", // used
            "./assets/fonts/Montserrat-Thin.ttf",
            "./assets/fonts/Montserrat-Black.ttf",
            "./assets/fonts/Montserrat-Light.ttf",
            "./assets/fonts/Montserrat-Italic.ttf",
            "./assets/fonts/Montserrat-Medium.ttf", // used
            "./assets/fonts/Montserrat-Regular.ttf", // used
            "./assets/fonts/Montserrat-SemiBold.ttf", // used
            "./assets/fonts/Montserrat-ExtraBold.ttf", // used
            "./assets/fonts/Montserrat-BoldItalic.ttf",
            "./assets/fonts/Montserrat-ExtraLight.ttf",
            "./assets/fonts/Montserrat-ThinItalic.ttf",
            "./assets/fonts/Montserrat-BlackItalic.ttf",
            "./assets/fonts/Montserrat-LightItalic.ttf",
            "./assets/fonts/Montserrat-MediumItalic.ttf",
            "./assets/fonts/Montserrat-SemiBoldItalic.ttf",
            "./assets/fonts/Montserrat-ExtraBoldItalic.ttf",
            "./assets/fonts/Montserrat-ExtraLightItalic.ttf",
          ],

          // Android-specific font family/weight mappings
          android: {
            fonts: [
              {
                fontFamily: "Montserrat",
                fontDefinitions: [
                  { path: "./assets/fonts/Montserrat-Thin.ttf", weight: 100 },
                  {
                    path: "./assets/fonts/Montserrat-ThinItalic.ttf",
                    weight: 100,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/Montserrat-ExtraLight.ttf",
                    weight: 200,
                  },
                  {
                    path: "./assets/fonts/Montserrat-ExtraLightItalic.ttf",
                    weight: 200,
                    style: "italic",
                  },
                  { path: "./assets/fonts/Montserrat-Light.ttf", weight: 300 },
                  {
                    path: "./assets/fonts/Montserrat-LightItalic.ttf",
                    weight: 300,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/Montserrat-Regular.ttf",
                    weight: 400,
                  },
                  {
                    path: "./assets/fonts/Montserrat-Italic.ttf",
                    weight: 400,
                    style: "italic",
                  },
                  { path: "./assets/fonts/Montserrat-Medium.ttf", weight: 500 },
                  {
                    path: "./assets/fonts/Montserrat-MediumItalic.ttf",
                    weight: 500,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/Montserrat-SemiBold.ttf",
                    weight: 600,
                  },
                  {
                    path: "./assets/fonts/Montserrat-SemiBoldItalic.ttf",
                    weight: 600,
                    style: "italic",
                  },
                  { path: "./assets/fonts/Montserrat-Bold.ttf", weight: 700 },
                  {
                    path: "./assets/fonts/Montserrat-BoldItalic.ttf",
                    weight: 700,
                    style: "italic",
                  },
                  {
                    path: "./assets/fonts/Montserrat-ExtraBold.ttf",
                    weight: 800,
                  },
                  {
                    path: "./assets/fonts/Montserrat-ExtraBoldItalic.ttf",
                    weight: 800,
                    style: "italic",
                  },
                  { path: "./assets/fonts/Montserrat-Black.ttf", weight: 900 },
                  {
                    path: "./assets/fonts/Montserrat-BlackItalic.ttf",
                    weight: 900,
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
