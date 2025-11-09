import type { Theme } from "@/api/common/theme-schema";

export type SearchType = "Track" | "Album" | "Choose type";

export interface SupabaseRecord {
  id: number;
  search_type: "Track" | "Album";
  search_param: string;
  artist_name: string;
  theme: Theme;
  accent_line: boolean;
  created_at: number;
  blurhash: string | null;
  synced: boolean;
  local_id: number;
  user_id: string;
}
