import { useCallback, useEffect, useState } from "react";
import type { MediaType } from "./vidy";

export interface Settings {
  accent: string; // hex with #
  autoplay: boolean;
  nextEpisode: boolean;
  episodeSelector: boolean;
  autoplayNextEpisode: boolean;
  resume: boolean;
  background: string; // preset id | "color" | "image"
  bgColor: string;
  bgImage: string; // image URL
  bgDim: number; // 0-80 overlay %
  cardSize: "compact" | "comfortable" | "large";
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  accent: "#E11D48",
  autoplay: false,
  nextEpisode: true,
  episodeSelector: true,
  autoplayNextEpisode: false,
  resume: true,
  background: "default",
  bgColor: "#0B0B12",
  bgImage: "",
  bgDim: 40,
  cardSize: "comfortable",
  reduceMotion: false,
};

export const BACKGROUNDS: { id: string; label: string; css: string }[] = [
  { id: "default", label: "Default", css: "" },
  { id: "midnight", label: "Midnight", css: "linear-gradient(160deg,#05060f,#101a3a 60%,#05060f)" },
  { id: "aurora", label: "Aurora", css: "radial-gradient(at 20% 10%,#0e7490 0,transparent 50%),radial-gradient(at 80% 20%,#7c3aed 0,transparent 50%),#07070d" },
  { id: "sunset", label: "Sunset", css: "linear-gradient(180deg,#1b0b2e,#7a1d4a 70%,#e2552d)" },
  { id: "forest", label: "Forest", css: "linear-gradient(160deg,#04110a,#0f3b25 70%,#04110a)" },
  { id: "amoled", label: "AMOLED", css: "#000" },
];

export interface ProgressEntry {
  key: string;
  type: MediaType;
  id: number;
  title: string;
  season?: number;
  episode?: number;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

const SETTINGS_KEY = "priview.settings.v1";
const HISTORY_KEY = "priview.history.v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setSettings({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(SETTINGS_KEY, {}) });
  }, []);
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return [settings, update] as const;
}

export const titleKey = (type: MediaType, id: number) => `${type}:${id}`;

export function useHistory() {
  const [history, setHistory] = useState<ProgressEntry[]>([]);
  useEffect(() => {
    const h = read<ProgressEntry[]>(HISTORY_KEY, []);
    setHistory(Array.isArray(h) ? h : []);
  }, []);
  const persist = (next: ProgressEntry[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 50)));
    return next;
  };
  const save = useCallback((entry: ProgressEntry) => {
    setHistory((h) => persist([entry, ...h.filter((e) => e.key !== entry.key)]));
  }, []);
  const remove = useCallback((key: string) => {
    setHistory((h) => persist(h.filter((e) => e.key !== key)));
  }, []);
  const clear = useCallback(() => setHistory(persist([])), []);
  return { history, save, remove, clear };
}

export function useBackground(s: Settings) {
  useEffect(() => {
    const b = document.body.style;
    const preset = BACKGROUNDS.find((x) => x.id === s.background);
    let img = "";
    if (s.background === "color") img = `linear-gradient(${s.bgColor},${s.bgColor})`;
    else if (s.background === "image" && /^https?:\/\//.test(s.bgImage)) {
      const d = s.bgDim / 100;
      img = `linear-gradient(rgba(0,0,0,${d}),rgba(0,0,0,${d})),url("${s.bgImage.replace(/"/g, "")}")`;
    } else if (preset) img = preset.css;
    b.backgroundImage = img;
    b.backgroundAttachment = "fixed";
    b.backgroundSize = "cover";
    document.documentElement.style.setProperty("--primary", s.accent);
    document.documentElement.classList.toggle("reduce-motion", s.reduceMotion);
  }, [s]);
}

const WL_KEY = "priview.watchlist.v1";
export function useWatchlist() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => setList(read<string[]>(WL_KEY, [])), []);
  const toggle = useCallback((k: string) => {
    setList((l) => {
      const n = l.includes(k) ? l.filter((x) => x !== k) : [k, ...l];
      localStorage.setItem(WL_KEY, JSON.stringify(n));
      return n;
    });
  }, []);
  return { list, toggle };
}
