export type ThemeTypes =
  | "Light"
  | "Dark"
  | "Catppuccin"
  | "Gruvbox"
  | "Nord"
  | "RosePine"
  | "Everforest";

export type SearchType = "Track" | "Album" | "Choose type";

export interface SupabaseRecord {
  id: number;
  search_type: "Track" | "Album";
  search_param: string;
  artist_name: string;
  theme: ThemeTypes;
  accent_line: boolean;
  created_at: number;
  blurhash: string | null;
  synced: boolean;
  local_id: number;
  user_id: string;
}
