import { View, Text, ViewProps, StyleSheet } from "react-native";
import React, { ReactNode } from "react";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

interface Props {
  safeAreaEdges?: Edge[];
  style?: ViewProps["style"];
  children: ReactNode;
}

const Background = ({
  safeAreaEdges = ["bottom", "top"],
  style = {},
  children,
}: Props) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0F172A'
    }
  });

  return (
    <SafeAreaView
      style={[style, styles.container, { backgroundColor: theme.colors.background }]}
      edges={safeAreaEdges}
    >
      {children}
    </SafeAreaView>
  );
};

export default Background;
