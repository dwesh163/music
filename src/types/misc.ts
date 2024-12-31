import type { ArtistMini } from "./artist";

export type Type =
  | "artist"
  | "album"
  | "playlist"
  | "radio"
  | "radio_station"
  | "song"
  | "channel"
  | "mix"
  | "show"
  | "episode"
  | "season"
  | "label";

export type Quality = string | { quality: string; url: string }[];

export type ImageQuality = "low" | "medium" | "high";

export type StreamQuality = "poor" | "low" | "medium" | "high" | "excellent";

export type Rights = {
  code: unknown;
  cacheable: unknown;
  delete_cached_object: unknown;
  reason: unknown;
};

export type Lang =
  | "hindi"
  | "english"
  | "punjabi"
  | "tamil"
  | "telugu"
  | "marathi"
  | "gujarati"
  | "bengali"
  | "kannada"
  | "bhojpuri"
  | "malayalam"
  | "urdu"
  | "haryanvi"
  | "rajasthani"
  | "odia"
  | "assamese";

export type Category = "latest" | "alphabetical" | "popularity";

export type Sort = "asc" | "desc";

export type Queue = {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  type: "song" | "episode";
  image: Quality;
  artists: ArtistMini[];
  download_url: Quality;
  duration: number;
};
