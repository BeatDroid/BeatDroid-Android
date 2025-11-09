import { themeSchema } from "@/api/common/theme-schema";
import { z } from "zod";

export const searchAlbumRequestSchema = z.object({
  album_name: z.string().min(1, "Album name is required"),
  artist_name: z.string().min(1, "Artist name is required"),
  theme: themeSchema.default("Dark"),
  accent: z.boolean().default(false),
});

export const searchAlbumResponseSchema = z.object({
  poster_url: z.string(),
  thumb_hash: z.string(),
  poster_filename: z.string(),
  name: z.string(),
  artist_name: z.string(),
});

export type SearchAlbumRequest = z.infer<typeof searchAlbumRequestSchema>;
export type SearchAlbumResponse = z.infer<typeof searchAlbumResponseSchema>;
