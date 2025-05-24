export interface searchTrackResponse {
  message: string;
  filePath: string;
  blurhash: string;
}

export interface searchTrackParameter {
  track_name: string;
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
