import { themeSchema } from "@/api/common/theme-schema";
import { z } from "zod";

export const searchTrackRequestSchema = z.object({
  song_name: z.string().min(1, "Track name is required"),
  artist_name: z.string().min(1, "Artist name is required"),
  theme: themeSchema.default("Dark"),
  accent: z.boolean().default(false),
  lyric_lines: z.string().optional(),
});

export const searchTrackResponseSchema = z.union([
  z.object({
    poster_url: z.string(),
    thumb_hash: z.string(),
    poster_filename: z.string(),
    name: z.string().min(1, "Track name cannot be empty"),
    artist_name: z.string().min(1, "Artist name cannot be empty"),
  }),
  z.object({
    name: z.string().min(1, "Track name cannot be empty"),
    artist_name: z.string().min(1, "Artist name cannot be empty"),
    lyrics: z.string(),
  }),
]);

export type SearchTrackRequest = z.infer<typeof searchTrackRequestSchema>;
export type SearchTrackResponse = z.infer<typeof searchTrackResponseSchema>;
