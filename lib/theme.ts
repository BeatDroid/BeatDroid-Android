// Centralized theme definitions derived from global.css CSS variables
// Light and Dark palettes and a React Navigation-compatible NAV_THEME export.

export type ThemeColors = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  popover: string;
  popoverForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  radius: string;
};

export const LIGHT_COLORS: ThemeColors = {
  background: "hsl(42 48% 98%)",
  foreground: "hsl(42 77% 5%)",
  muted: "hsl(42 24% 85%)",
  mutedForeground: "hsl(42 1% 30%)",
  popover: "hsl(42 48% 98%)",
  popoverForeground: "hsl(42 77% 5%)",
  card: "hsl(42 48% 98%)",
  cardForeground: "hsl(42 77% 5%)",
  border: "hsl(42 4% 93%)",
  input: "hsl(42 4% 93%)",
  primary: "hsl(42 22% 76%)",
  primaryForeground: "hsl(42 22% 16%)",
  secondary: "hsl(42 4% 86%)",
  secondaryForeground: "hsl(42 4% 26%)",
  accent: "hsl(42 14% 79%)",
  accentForeground: "hsl(42 14% 19%)",
  destructive: "hsl(18 98% 36%)",
  destructiveForeground: "hsl(0 0% 100%)",
  ring: "hsl(42 22% 76%)",
  chart1: "hsl(42 22% 76%)",
  chart2: "hsl(42 4% 86%)",
  chart3: "hsl(42 14% 79%)",
  chart4: "hsl(42 4% 89%)",
  chart5: "hsl(42 25% 76%)",
  radius: "0.5rem",
};

export const DARK_COLORS: ThemeColors = {
  background: "hsl(42.22 5.07% 8.79%)",
  foreground: "hsl(42 38% 99%)",
  muted: "hsl(42 24% 15%)",
  mutedForeground: "hsl(42 1% 70%)",
  popover: "hsl(40 9.88% 9.8%)",
  popoverForeground: "hsl(42 38% 99%)",
  card: "hsl(40 11.22% 13.83%)",
  cardForeground: "hsl(42 38% 99%)",
  border: "hsl(42 4% 14%)",
  input: "hsl(42 4% 14%)",
  primary: "hsl(42 22% 76%)",
  primaryForeground: "hsl(42 22% 16%)",
  secondary: "hsl(42 7% 14%)",
  secondaryForeground: "hsl(42 7% 74%)",
  accent: "hsl(42 17% 23%)",
  accentForeground: "hsl(42 17% 83%)",
  destructive: "hsl(18 98% 57%)",
  destructiveForeground: "hsl(42.22 0% 0%)",
  ring: "hsl(42 22% 76%)",
  chart1: "hsl(42 22% 76%)",
  chart2: "hsl(42 27.73% 30.11%)",
  chart3: "hsl(42 17% 23%)",
  chart4: "hsl(42 7% 17%)",
  chart5: "hsl(42 25% 76%)",
  radius: "0.5rem",
};

// React Navigation compatible theme colors (maps to Theme['colors'])
export const NAV_THEME = {
  light: {
    background: LIGHT_COLORS.background,
    border: LIGHT_COLORS.border,
    card: LIGHT_COLORS.card,
    notification: LIGHT_COLORS.destructive,
    primary: LIGHT_COLORS.primary,
    text: LIGHT_COLORS.foreground,
  },
  dark: {
    background: DARK_COLORS.background,
    border: DARK_COLORS.border,
    card: DARK_COLORS.card,
    notification: DARK_COLORS.destructive,
    primary: DARK_COLORS.primary,
    text: DARK_COLORS.foreground,
  },
} as const;

export type NavThemeMode = keyof typeof NAV_THEME; // 'light' | 'dark'

export const getThemeColors = (mode: NavThemeMode): ThemeColors =>
  mode === "dark" ? DARK_COLORS : LIGHT_COLORS;
