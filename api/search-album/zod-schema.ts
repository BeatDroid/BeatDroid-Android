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

export const searchAlbumRequestSchema = z.object({
  album_name: z.string().min(1, 'Album name is required'),
  artist_name: z.string().min(1, 'Artist name is required'),
  theme: themeSchema.default('Dark'),
  accent: z.boolean().default(false),
  indexing: z.boolean().default(true).optional()
});

export const searchAlbumResponseSchema = z.object({
  message: z.string(),
  filePath: z.string(),
  blurhash: z.string()
});

export type SearchAlbumRequest = z.infer<typeof searchAlbumRequestSchema>;
export type SearchAlbumResponse = z.infer<typeof searchAlbumResponseSchema>;
