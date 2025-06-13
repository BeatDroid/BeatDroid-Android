import type { ThemeTypes } from "@/lib/types";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const searchTypes = ["Track", "Album"] as const;

export const themeTypes = [
  "Light",
  "Dark",
  "Catppuccin",
  "Gruvbox",
  "Nord",
  "RosePine",
  "Everforest",
] as const satisfies readonly ThemeTypes[];

export const searchHistoryTable = sqliteTable(
  "search_history",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

    searchType: text("search_type", { enum: searchTypes }).notNull(),

    searchParam: text("search_param").notNull(),
    artistName: text("artist_name").notNull(),
    theme: text("theme", { enum: themeTypes }).notNull().default("Dark"),
    accentLine: integer("accent_line", { mode: "boolean" })
      .notNull()
      .default(false),

    artworkUrl: text("artwork_url"),
    artworkSha256: text("artwork_sha256"),
    blurhash: text("blurhash"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    searchTypeIdx: index("search_type_idx").on(table.searchType),
    artistNameIdx: index("artist_name_idx").on(table.artistName),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type SearchHistory = typeof searchHistoryTable.$inferSelect;
export type NewSearchHistory = typeof searchHistoryTable.$inferInsert;
