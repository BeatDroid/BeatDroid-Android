import type { Theme } from "@/api/common/theme-schema";

export const themes: Record<
  Theme,
  {
    bg: string;
    fg: string;
    text: string;
    b1: string;
    b2: string;
    b3: string;
  }
> = {
  Light: {
    bg: "#D1C9B5",
    fg: "#322E30",
    text: "#322E30",
    b1: "#322E30",
    b2: "#322E30",
    b3: "#322E30",
  },
  Dark: {
    bg: "#1D1D1D",
    fg: "#C0BDB1",
    text: "#C0BDB1",
    b1: "#C0BDB1",
    b2: "#C0BDB1",
    b3: "#C0BDB1",
  },
  Catppuccin: {
    bg: "#171825",
    fg: "#8BAAED",
    text: "#64687D",
    b1: "#9FC783",
    b2: "#EF9E75",
    b3: "#E68184",
  },
  Gruvbox: {
    bg: "#1C1F21",
    fg: "#7DADA3",
    text: "#DDC7A0",
    b1: "#A9B565",
    b2: "#E6894D",
    b3: "#E96862",
  },
  Nord: {
    bg: "#2D333F",
    fg: "#8EBCBB",
    text: "#D8DDE8",
    b1: "#A3BD8B",
    b2: "#D08770",
    b3: "#BF6069",
  },
  RosePine: {
    bg: "#1F1D2D",
    fg: "#C3A6E6",
    text: "#E0DDF3",
    b1: "#9BCED7",
    b2: "#F6C176",
    b3: "#EB6F91",
  },
  Everforest: {
    bg: "#262E33",
    fg: "#7FBBB3",
    text: "#D3C5AA",
    b1: "#A6C07F",
    b2: "#E59874",
    b3: "#E67D7F",
  },
};
