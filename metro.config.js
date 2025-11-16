const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);
config.resolver.sourceExts.push("sql");

module.exports = withNativeWind(wrapWithReanimatedMetroConfig(config), {
  input: "./global.css",
  inlineRem: 16,
});
