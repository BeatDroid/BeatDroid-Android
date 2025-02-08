import React, { ReactNode } from "react";
import { ViewProps } from "react-native";
import { useTheme } from "react-native-paper";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface Props {
  safeAreaEdges?: Edge[];
  style?: ViewProps["style"];
  className?: string;
  children: ReactNode;
}

const Background = ({
  safeAreaEdges = ["bottom", "top"],
  style = {},
  className = "flex-1 p-4",
  children,
}: Props) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      className={className}
      style={[style, { backgroundColor: theme.colors.background }]}
      edges={safeAreaEdges}
    >
      {children}
    </SafeAreaView>
  );
};

export default Background;
