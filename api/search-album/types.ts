export interface searchPosterResponse {
  message: string;
  filePath: string;
  blurhash: string;
}

export interface searchPosterParameter {
  album_name: string;
  artist_name: string;
  theme?:
    | "Light"
    | "Dark"
    | "Catppuccin"
    | "Gruvbox"
    | "Nord"
    | "RosePine"
    | "Everforest";
  accent?: boolean;
}
