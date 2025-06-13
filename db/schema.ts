import type { ThemeTypes } from "@/lib/types";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Types for search
export const searchTypes = ["Track", "Album"] as const;

// Define theme types as a const array for Drizzle's enum
export const themeTypes = [
  "Light",
  "Dark",
  "Catppuccin",
  "Gruvbox",
  "Nord",
  "RosePine",
  "Everforest",
] as const satisfies readonly ThemeTypes[];

// Search history table
export const searchHistoryTable = sqliteTable(
  "search_history",
  {
    // Primary key
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

    // Search type (Track or Album)
    searchType: text("search_type", { enum: searchTypes }).notNull(),

    // Search parameters
    searchParam: text("search_param").notNull(), // Track name or Album name
    artistName: text("artist_name").notNull(),

    // Display options
    theme: text("theme", { enum: themeTypes }).notNull().default("Dark"),
    accentLine: integer("accent_line", { mode: "boolean" })
      .notNull()
      .default(false),

    // Artwork information
    artworkUrl: text("artwork_url"),
    artworkSha256: text("artwork_sha256"), // SHA256 hash of the artwork
    blurhash: text("blurhash"), // Blurhash string for placeholder

    // Timestamp
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Indexes for better query performance
    searchTypeIdx: index("search_type_idx").on(table.searchType),
    artistNameIdx: index("artist_name_idx").on(table.artistName),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

// Type inference
export type SearchHistory = typeof searchHistoryTable.$inferSelect;
export type NewSearchHistory = typeof searchHistoryTable.$inferInsert;
