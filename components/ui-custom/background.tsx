import React, { ReactNode } from "react";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface Props {
  safeAreaEdges?: Edge[];
  className?: string;
  children: ReactNode;
}

const Background = ({
  safeAreaEdges = ["bottom", "top"],
  className = "",
  children,
}: Props) => {
  return (
    <SafeAreaView
      className={`flex-1 p-4 bg-background ${className}`}
      edges={safeAreaEdges}
    >
      {children}
    </SafeAreaView>
  );
};

export default Background;
