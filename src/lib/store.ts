import { useCallback, useEffect, useState } from "react";
import type { MediaType } from "./vidy";

export interface Settings {
  accent: string; // hex with #
  autoplay: boolean;
  nextEpisode: boolean;
  episodeSelector: boolean;
  autoplayNextEpisode: boolean;
  resume: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  accent: "#E11D48",
  autoplay: false,
  nextEpisode: true,
  episodeSelector: true,
  autoplayNextEpisode: false,
  resume: true,
};

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

const SETTINGS_KEY = "reel.settings.v1";
const HISTORY_KEY = "reel.history.v1";

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
