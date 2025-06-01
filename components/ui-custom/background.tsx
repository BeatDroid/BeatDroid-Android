import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface Props {
  safeAreaEdges?: Edge[];
  className?: string;
  children: ReactNode;
}

const Background = ({
  className,
  children,
}: Props) => {
  return (
    <SafeAreaView
      className={cn(`flex-1 py-4 px-5 bg-background my-safe`, className)}
      edges={[]}
    >
      {children}
    </SafeAreaView>
  );
};

export default Background;
