import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useColorScheme as useReactNativeColorScheme } from "react-native";
import { useCallback, useEffect } from "react";
import { useMMKVString } from "react-native-mmkv";

export function useColorScheme() {
  const { setColorScheme } = useNativewindColorScheme();
  const colorScheme = useReactNativeColorScheme();
  const [savedColorScheme, setSavedColorScheme] = useMMKVString("colorScheme");
  const theme = savedColorScheme || colorScheme;

  useEffect(() => {
    setColorScheme(theme as "dark" | "light");
  }, [theme, setColorScheme]);

  const toggleColorScheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setSavedColorScheme(newTheme);
  }, [theme, setSavedColorScheme]);

  const isDarkColorScheme = useCallback(() => theme === "dark", [theme]);

  return {
    colorScheme: theme!,
    isDarkColorScheme,
    setColorScheme: setSavedColorScheme,
    toggleColorScheme,
  };
}
