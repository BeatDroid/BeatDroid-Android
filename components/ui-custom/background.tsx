import React, { ReactNode } from "react";
import { ViewProps } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface Props {
  safeAreaEdges?: Edge[];
  className?: string;
  children: ReactNode;
}

const Background = ({
  safeAreaEdges = ["bottom", "top"],
  className = "flex-1 p-4 bg-background",
  children,
}: Props) => {
  return (
    <SafeAreaView className={className} edges={safeAreaEdges}>
      {children}
    </SafeAreaView>
  );
};

export default Background;
