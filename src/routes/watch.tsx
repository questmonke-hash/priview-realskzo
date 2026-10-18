import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { VidyPlayer } from "@/components/player/VidyPlayer";
import { SettingsSheet } from "@/components/player/SettingsSheet";
import { MediaPicker } from "@/components/player/MediaPicker";
import { ContinueWatching, Library } from "@/components/player/Shelves";
import { AppHeader } from "@/components/player/AppHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SAMPLE_CATALOG, fallbackMedia, findMedia, type MediaItem } from "@/lib/catalog";
import { titleKey, useBackground, useHistory, useSettings, type ProgressEntry } from "@/lib/store";
import { buildEmbedUrl, type MediaType, type PlayerEvent } from "@/lib/vidy";

export const Route = createFileRoute("/watch")({
  validateSearch: (s: Record<string, unknown>): { type?: MediaType; id?: number } => {
    const id = Number(s.id);
    const type = s.type === "movie" || s.type === "tv" || s.type === "anime" ? s.type : undefined;
    return type && Number.isInteger(id) && id > 0 ? { type, id } : {};
  },
  head: () => ({
    meta: [
      { title: "Watch — PriView" },
      { name: "description", content: "Watch movies, series and anime on PriView." },
      { property: "og:title", content: "Watch — PriView" },
      { property: "og:description", content: "Watch movies, series and anime on PriView." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WatchPage,
});

interface Current {
  media: MediaItem;
  season: number;
  episode: number;
  startAt: number;
}

const typeLabel = { movie: "Movie", tv: "Series", anime: "Anime" } as const;

function WatchPage() {
  const [settings, updateSettings] = useSettings();
  const { history, save, remove, clear } = useHistory();
  const search = Route.useSearch();
  const [current, setCurrent] = useState<Current>(() => ({
    media: (search.type && search.id && (findMedia(search.type, search.id) ?? fallbackMedia(search.type, search.id))) || SAMPLE_CATALOG[0],
    season: 1,
    episode: 1,
    startAt: 0,
  }));
  const [live, setLive] = useState<{ status: string; time: number; duration: number }>({ status: "idle", time: 0, duration: 0 });
  const lastSave = useRef(0);

  // Apply the accent globally so popovers and sheets pick it up too.
  useBackground(settings);
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || !history.length) return;
    resumed.current = true;
    const h = history.find((x) => x.key === titleKey(current.media.type, current.media.id));
    if (h && settings.resume) setCurrent((c) => ({ ...c, season: h.season ?? 1, episode: h.episode ?? 1, startAt: h.currentTime }));
  }, [history]); // eslint-disable-line react-hooks/exhaustive-deps

  const { media, season, episode } = current;
  const key = titleKey(media.type, media.id);
  const episodeCount = media.seasons?.[media.type === "tv" ? season - 1 : 0] ?? 1;

  const open = useCallback(
    (m: MediaItem, s?: number, e?: number) => {
      const saved = history.find((h) => h.key === titleKey(m.type, m.id));
      const sameEp = saved && (s === undefined || (saved.season === s && saved.episode === e));
      setCurrent({
        media: m,
        season: s ?? saved?.season ?? 1,
        episode: e ?? saved?.episode ?? 1,
        startAt: settings.resume && sameEp && saved ? saved.currentTime : 0,
      });
      setLive({ status: "idle", time: 0, duration: 0 });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [history, settings.resume],
  );

  const openById = (type: MediaType, id: number) => open(findMedia(type, id) ?? fallbackMedia(type, id));

  const goEpisode = (s: number, e: number) => setCurrent((c) => ({ ...c, season: s, episode: e, startAt: 0 }));

  const next = useMemo(() => {
    if (media.type === "movie") return null;
    if (episode < episodeCount) return { s: season, e: episode + 1 };
    if (media.type === "tv" && media.seasons && season < media.seasons.length) return { s: season + 1, e: 1 };
    return null;
  }, [media, season, episode, episodeCount]);
  const prev = media.type !== "movie" && episode > 1 ? { s: season, e: episode - 1 } : null;

  const src = useMemo(
    () =>
      buildEmbedUrl(
        { type: media.type, id: media.id, season, episode },
        {
          color: settings.accent,
          progress: current.startAt,
          autoplay: settings.autoplay,
          nextEpisode: settings.nextEpisode,
          episodeSelector: settings.episodeSelector,
          autoplayNextEpisode: settings.autoplayNextEpisode,
        },
      ),
    // startAt is only read when the title/episode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [media, season, episode, settings.accent, settings.autoplay, settings.nextEpisode, settings.episodeSelector, settings.autoplayNextEpisode],
  );

  const handleEvent = useCallback(
    (ev: PlayerEvent) => {
      setLive({ status: ev.event, time: ev.currentTime, duration: ev.duration });
      const now = Date.now();
      if (ev.event === "timeupdate" && now - lastSave.current < 5000) return;
      lastSave.current = now;
      const entry: ProgressEntry = {
        key,
        type: media.type,
        id: media.id,
        title: media.title,
        season: media.type === "tv" ? season : undefined,
        episode: media.type === "movie" ? undefined : episode,
        currentTime: ev.event === "ended" ? 0 : ev.currentTime,
        duration: ev.duration,
        updatedAt: now,
      };
      if (ev.event === "ended" && media.type === "movie") remove(key);
      else if (ev.currentTime > 5 || ev.event === "ended") save(entry);
      if (ev.event === "ended" && next && !settings.autoplayNextEpisode) {
        toast("Episode finished", { action: { label: "Next episode", onClick: () => goEpisode(next.s, next.e) } });
      }
    },
    [key, media, season, episode, next, save, remove, settings.autoplayNextEpisode],
  );

  const pickHistory = (h: ProgressEntry) => {
    const m = findMedia(h.type, h.id) ?? { ...fallbackMedia(h.type, h.id), title: h.title };
    open(m, h.season ?? 1, h.episode ?? 1);
  };

  const fmt = (t: number) => {
    const s = Math.floor(t);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h ? `${h}:` : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen">
      <AppHeader settings={settings} update={updateSettings} />

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-6 sm:px-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <VidyPlayer src={src} title={media.title} onEvent={handleEvent} />

            {media.type !== "movie" && (
              <div className="flex flex-wrap items-center gap-2">
                {media.type === "tv" && media.seasons && (
                  <Select value={String(season)} onValueChange={(v) => goEpisode(Number(v), 1)}>
                    <SelectTrigger aria-label="Season" className="w-32 rounded-full bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {media.seasons.map((_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>Season {i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={String(episode)} onValueChange={(v) => goEpisode(season, Number(v))}>
                  <SelectTrigger aria-label="Episode" className="w-36 rounded-full bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {Array.from({ length: Math.min(episodeCount, 2000) }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>Episode {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="ml-auto flex gap-2">
                  <button
                    disabled={!prev}
                    onClick={() => prev && goEpisode(prev.s, prev.e)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button
                    disabled={!next}
                    onClick={() => next && goEpisode(next.s, next.e)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div key={key + season + episode} className="animate-reel rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-primary/15 px-2.5 py-1 font-semibold text-primary">{typeLabel[media.type]}</span>
                {media.year > 0 && <span className="text-muted-foreground">{media.year}</span>}
                {media.type !== "movie" && (
                  <span className="text-muted-foreground">
                    {media.type === "tv" ? `S${season} · ` : ""}E{episode}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight">{media.title}</h1>
              {media.genres.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">{media.genres.join(" · ")}</p>
              )}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{media.overview}</p>
              <div className="mt-5 border-t border-border pt-4">
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{live.status === "idle" ? "Waiting for playback" : live.status === "timeupdate" ? "Playing" : live.status}</span>
                  {live.duration > 0 && <span>{fmt(live.time)} / {fmt(live.duration)}</span>}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${live.duration ? (live.time / live.duration) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Play by ID</p>
              <MediaPicker onSubmit={openById} />
            </div>
          </aside>
        </div>

        <ContinueWatching items={history} onPick={pickHistory} onRemove={remove} onClear={clear} />
        <Library items={SAMPLE_CATALOG} onPick={(m) => open(m)} activeKey={key} />

        <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
          PriView · Playback is provided by the Vidy embed. Only watch content you're authorised to access.
        </footer>
      </main>
    </div>
  );
}
