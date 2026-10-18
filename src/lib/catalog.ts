import type { MediaType } from "./vidy";

// Sample metadata used until a real metadata API (e.g. TMDB) is configured.
export interface MediaItem {
  type: MediaType;
  id: number;
  title: string;
  year: number;
  genres: string[];
  overview: string;
  /** Episode count per season (TV) or a single entry (anime). */
  seasons?: number[];
}

export const SAMPLE_CATALOG: MediaItem[] = [
  {
    type: "movie",
    id: 315162,
    title: "Puss in Boots: The Last Wish",
    year: 2022,
    genres: ["Animation", "Adventure", "Comedy"],
    overview:
      "Puss in Boots discovers that his passion for adventure has taken its toll: he has burned through eight of his nine lives, and sets off to find the mythical Last Wish.",
  },
  {
    type: "movie",
    id: 27205,
    title: "Inception",
    year: 2010,
    genres: ["Sci-Fi", "Action", "Thriller"],
    overview:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  },
  {
    type: "tv",
    id: 1396,
    title: "Breaking Bad",
    year: 2008,
    genres: ["Drama", "Crime"],
    overview:
      "A high school chemistry teacher diagnosed with cancer turns to manufacturing and selling methamphetamine to secure his family's future.",
    seasons: [7, 13, 13, 13, 16],
  },
  {
    type: "tv",
    id: 1399,
    title: "Game of Thrones",
    year: 2011,
    genres: ["Drama", "Fantasy"],
    overview:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    seasons: [10, 10, 10, 10, 10, 10, 7, 6],
  },
  {
    type: "anime",
    id: 16498,
    title: "Attack on Titan",
    year: 2013,
    genres: ["Action", "Drama", "Fantasy"],
    overview:
      "Humanity lives inside cities surrounded by enormous walls that protect them from gigantic man-eating humanoids called Titans.",
    seasons: [25],
  },
  {
    type: "anime",
    id: 21,
    title: "One Piece",
    year: 1999,
    genres: ["Action", "Adventure", "Comedy"],
    overview:
      "Monkey D. Luffy sets out to find the legendary treasure One Piece and become King of the Pirates.",
    seasons: [1100],
  },
];

export function findMedia(type: MediaType, id: number): MediaItem | undefined {
  return SAMPLE_CATALOG.find((m) => m.type === type && m.id === id);
}

export function fallbackMedia(type: MediaType, id: number): MediaItem {
  const label = type === "movie" ? "Movie" : type === "tv" ? "Series" : "Anime";
  return {
    type,
    id,
    title: `${label} #${id}`,
    year: 0,
    genres: [],
    overview: "No local metadata for this title. Playback uses the ID you entered.",
    seasons: type === "tv" ? Array(10).fill(30) : type === "anime" ? [2000] : undefined,
  };
}
