import { z } from 'zod';

export const themeSchema = z.union([
  z.literal('Light'),
  z.literal('Dark'),
  z.literal('Catppuccin'),
  z.literal('Gruvbox'),
  z.literal('Nord'),
  z.literal('RosePine'),
  z.literal('Everforest')
]);

export type Theme = z.infer<typeof themeSchema>;

export const searchTrackRequestSchema = z.object({
  track_name: z.string().min(1, 'Track name is required'),
  artist_name: z.string().min(1, 'Artist name is required'),
  theme: themeSchema.default('Dark'),
  accent: z.boolean().default(false),
  indexing: z.boolean().default(true).optional()
});

export const searchTrackResponseSchema = z.object({
  data: z.object({
    filePath: z.string(),
    thumbhash: z.string(),
    type: z.string(),
    trackName: z.string(),
    artistName: z.string(),
  }).optional(),
  message: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
  details: z.string().optional(),
});

export type SearchTrackRequest = z.infer<typeof searchTrackRequestSchema>;
export type SearchTrackResponse = z.infer<typeof searchTrackResponseSchema>;
