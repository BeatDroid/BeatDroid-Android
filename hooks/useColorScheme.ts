import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useMMKVString } from "react-native-mmkv";

export function useColorScheme() {
  const { setColorScheme } = useNativewindColorScheme();
  const colorScheme = useRNColorScheme();
  const [savedColorScheme, setSavedColorScheme] = useMMKVString("colorScheme");
  const theme = savedColorScheme || colorScheme || "dark";
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
