import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme as useReactNativeColorScheme } from "react-native";
import { useMMKVString } from "react-native-mmkv";

export function useColorScheme() {
  const { setColorScheme } = useNativewindColorScheme();
  const colorScheme = useReactNativeColorScheme();
  const [savedColorScheme, setSavedColorScheme] = useMMKVString("colorScheme");
  const theme = savedColorScheme || colorScheme;
  const [isDarkColorScheme, setIsDarkColorScheme] = useState<boolean>(
    theme === "dark",
  );

  useEffect(() => {
    setColorScheme(theme as "dark" | "light");
    setIsDarkColorScheme(theme === "dark");
  }, [theme, setColorScheme]);

  const toggleColorScheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setSavedColorScheme(newTheme);
  }, [theme, setSavedColorScheme]);

  return {
    colorScheme: theme!,
    isDarkColorScheme,
    setColorScheme: setSavedColorScheme,
    toggleColorScheme,
  };
}
