import { z } from "zod";

export const themeSchema = z.union([
  z.literal("Light"),
  z.literal("Dark"),
  z.literal("Catppuccin"),
  z.literal("Gruvbox"),
  z.literal("Nord"),
  z.literal("RosePine"),
  z.literal("Everforest"),
]);

export type Theme = z.infer<typeof themeSchema>;
