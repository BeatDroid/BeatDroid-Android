import { useWindowDimensions } from "react-native";

export const useResponsiveLayout = (breakpoint: number = 400) => {
  const { width } = useWindowDimensions();
  return width < breakpoint;
};
