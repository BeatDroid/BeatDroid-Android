import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  disableSafeArea?: boolean;
  className?: string;
  children: ReactNode;
}

const Background = ({ className, children, disableSafeArea }: Props) => {
  return (
    <SafeAreaView
      className={cn(
        `flex-1 px-5 bg-background`,
        disableSafeArea ? "" : "py-safe",
        className,
      )}
      edges={[]}
    >
      {children}
    </SafeAreaView>
  );
};

export default Background;
