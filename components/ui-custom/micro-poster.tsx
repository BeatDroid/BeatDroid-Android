import { themes } from "@/lib/constants";
import { ThemeTypes } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { memo } from "react";
import { View } from "react-native";

interface MicroPosterProps {
  theme?: ThemeTypes;
  accentEnabled?: boolean;
  microMode?: boolean;
  className?: string;
}

const MicroPosterBase = ({
  theme = "Light",
  accentEnabled = false,
  className = "",
}: MicroPosterProps) => {
  const backgroundColor = themes[theme].bg;
  const posterColor = themes[theme].fg;
  const textColor = themes[theme].text;

  const backgroundStyle = {
    backgroundColor: backgroundColor,
  };

  const posterStyle = {
    backgroundColor: posterColor,
  };

  const textStyle = {
    backgroundColor: textColor,
  };

  const accentLineStyle = {
    backgroundColor: accentEnabled ? posterColor : "transparent",
  };

  return (
    <View
      style={backgroundStyle}
      className={cn(
        "aspect-[7.3/10] h-full self-center pt-2 rounded-lg overflow-hidden",
        className,
      )}
    >
      <View
        style={posterStyle}
        className="flex-1 mx-2 rounded-sm items-center justify-center"
      />
      <View
        style={textStyle}
        className="mt-1 mx-2 h-1.5 w-[60%] rounded-full"
      />
      <View
        style={textStyle}
        className="mt-1 mx-2 h-1.5 w-[30%] rounded-full"
      />
      <View style={accentLineStyle} className="mt-2 h-1 w-full" />
    </View>
  );
};

export const MicroPoster = memo(MicroPosterBase);
