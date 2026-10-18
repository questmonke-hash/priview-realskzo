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
  /** Sample streaming availability (replace with TMDB watch-provider data). */
  services?: string[];
  /** Sample popularity / trending rank (lower = hotter). */
  popular?: number;
  trending?: number;
}

export const SERVICES = ["Netflix", "Disney+", "Prime Video", "Max", "Hulu", "Apple TV+", "Crunchyroll"] as const;

export const SAMPLE_CATALOG: MediaItem[] = [
  {
    type: "movie",
    id: 315162,
    services: ["Prime Video"],
    popular: 5,
    trending: 3,
    title: "Puss in Boots: The Last Wish",
    year: 2022,
    genres: ["Animation", "Adventure", "Comedy"],
    overview:
      "Puss in Boots discovers that his passion for adventure has taken its toll: he has burned through eight of his nine lives, and sets off to find the mythical Last Wish.",
  },
  {
    type: "movie",
    id: 27205,
    services: ["Netflix", "Max"],
    popular: 2,
    trending: 6,
    title: "Inception",
    year: 2010,
    genres: ["Sci-Fi", "Action", "Thriller"],
    overview:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  },
  {
    type: "tv",
    id: 1396,
    services: ["Netflix"],
    popular: 1,
    trending: 4,
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
    services: ["Max"],
    popular: 3,
    trending: 9,
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
    services: ["Crunchyroll", "Hulu"],
    popular: 4,
    trending: 2,
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
    services: ["Crunchyroll", "Netflix"],
    popular: 6,
    trending: 1,
    title: "One Piece",
    year: 1999,
    genres: ["Action", "Adventure", "Comedy"],
    overview:
      "Monkey D. Luffy sets out to find the legendary treasure One Piece and become King of the Pirates.",
    seasons: [1100],
  },
  {
    type: "movie",
    id: 157336,
    title: "Interstellar",
    year: 2014,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    services: ["Prime Video", "Max"],
    popular: 7,
    trending: 8,
  },
  {
    type: "movie",
    id: 155,
    title: "The Dark Knight",
    year: 2008,
    genres: ["Action", "Crime", "Drama"],
    overview: "Batman raises the stakes in his war on crime as the Joker unleashes chaos on Gotham.",
    services: ["Max", "Netflix"],
    popular: 8,
    trending: 10,
  },
  {
    type: "movie",
    id: 129,
    title: "Spirited Away",
    year: 2001,
    genres: ["Animation", "Fantasy", "Family"],
    overview: "A girl wanders into a world ruled by gods, witches and spirits, where humans are changed into beasts.",
    services: ["Max", "Netflix"],
    popular: 12,
    trending: 14,
  },
  {
    type: "tv",
    id: 66732,
    title: "Stranger Things",
    year: 2016,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.",
    services: ["Netflix"],
    popular: 9,
    trending: 5,
    seasons: [8, 9, 8, 9, 8],
  },
  {
    type: "tv",
    id: 94997,
    title: "House of the Dragon",
    year: 2022,
    genres: ["Drama", "Fantasy", "Action"],
    overview: "The Targaryen civil war, set about 200 years before the events of Game of Thrones.",
    services: ["Max"],
    popular: 13,
    trending: 7,
    seasons: [10, 10, 8],
  },
  {
    type: "tv",
    id: 136315,
    title: "The Bear",
    year: 2022,
    genres: ["Drama", "Comedy"],
    overview: "A young chef returns home to run his family's sandwich shop in Chicago.",
    services: ["Hulu", "Disney+"],
    popular: 11,
    trending: 11,
    seasons: [8, 10, 10],
  },
  {
    type: "tv",
    id: 76479,
    title: "The Boys",
    year: 2019,
    genres: ["Action", "Comedy", "Sci-Fi"],
    overview: "Vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
    services: ["Prime Video"],
    popular: 10,
    trending: 12,
    seasons: [8, 8, 8, 8],
  },
  {
    type: "anime",
    id: 1535,
    title: "Death Note",
    year: 2006,
    genres: ["Mystery", "Thriller", "Supernatural"],
    overview: "A student finds a notebook that kills anyone whose name is written in it.",
    services: ["Netflix", "Hulu"],
    popular: 14,
    trending: 15,
    seasons: [37],
  },
  {
    type: "anime",
    id: 101922,
    title: "Demon Slayer",
    year: 2019,
    genres: ["Action", "Fantasy", "Drama"],
    overview: "A boy becomes a demon slayer after his family is slaughtered and his sister turned into a demon.",
    services: ["Crunchyroll", "Netflix"],
    popular: 15,
    trending: 3,
    seasons: [26, 18, 11, 8],
  },
  {
    type: "anime",
    id: 40748,
    title: "Jujutsu Kaisen",
    year: 2020,
    genres: ["Action", "Fantasy", "Supernatural"],
    overview: "A high schooler swallows a cursed talisman and joins a school of sorcerers.",
    services: ["Crunchyroll", "Hulu"],
    popular: 16,
    trending: 13,
    seasons: [24, 23],
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

const sk = (m: MediaItem) => `${m.type}:${m.id}`;

/** "Because you watched X": rank unseen titles by shared genres (+ same type bonus). */
export function similarTo(base: MediaItem, limit = 12, exclude: string[] = []): MediaItem[] {
  return SAMPLE_CATALOG.filter((m) => sk(m) !== sk(base) && !exclude.includes(sk(m)))
    .map((m) => ({
      m,
      score: m.genres.filter((g) => base.genres.includes(g)).length * 2 + (m.type === base.type ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
}

export const byPopular = () => [...SAMPLE_CATALOG].sort((a, b) => (a.popular ?? 99) - (b.popular ?? 99));
export const byTrending = () => [...SAMPLE_CATALOG].sort((a, b) => (a.trending ?? 99) - (b.trending ?? 99));
export const onService = (s: string) => SAMPLE_CATALOG.filter((m) => m.services?.includes(s));
export const ofType = (t: MediaType) => SAMPLE_CATALOG.filter((m) => m.type === t);
export const searchCatalog = (q: string) =>
  SAMPLE_CATALOG.filter((m) => `${m.title} ${m.genres.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()));
