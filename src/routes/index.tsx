import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Play, Search, Shuffle } from "lucide-react";
import { AppHeader } from "@/components/player/AppHeader";
import { ContinueWatching, Poster } from "@/components/player/Shelves";
import {
  SAMPLE_CATALOG, SERVICES, byPopular, byTrending, findMedia, ofType, onService, searchCatalog, similarTo, type MediaItem,
} from "@/lib/catalog";
import { titleKey, useBackground, useHistory, useSettings, useWatchlist, type ProgressEntry } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PriView — Movies, series & anime" },
      { name: "description", content: "Discover what to watch across streaming services, pick up where you left off and get picks based on what you've watched." },
      { property: "og:title", content: "PriView — Movies, series & anime" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

const sizes = { compact: "w-28", comfortable: "w-36", large: "w-48" } as const;

function Row({ title, items, size, wl, onToggle }: { title: string; items: MediaItem[]; size: string; wl: string[]; onToggle: (k: string) => void }) {
  if (!items.length) return null;
  return (
    <section className="animate-reel">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {items.map((m) => {
          const k = titleKey(m.type, m.id);
          const saved = wl.includes(k);
          return (
            <div key={k} className={`group relative shrink-0 ${size}`}>
              <Link
                to="/watch"
                search={{ type: m.type, id: m.id }}
                className="block overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Poster title={m.title} className="aspect-[2/3] transition group-hover:brightness-110" />
                <div className="p-2.5">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.type === "tv" ? "Series" : m.type === "anime" ? "Anime" : "Movie"} · {m.year}</p>
                </div>
              </Link>
              <button
                aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
                onClick={() => onToggle(k)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
              >
                {saved ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HomePage() {
  const [settings, update] = useSettings();
  useBackground(settings);
  const { history, remove, clear } = useHistory();
  const { list: wl, toggle } = useWatchlist();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [svc, setSvc] = useState<string>(SERVICES[0]);
  const [type, setType] = useState<"all" | "movie" | "tv" | "anime">("all");
  const size = sizes[settings.cardSize];

  const seen = history.map((h) => h.key);
  const because = useMemo(
    () =>
      history.slice(0, 3).flatMap((h: ProgressEntry) => {
        const base = findMedia(h.type, h.id);
        if (!base) return [];
        const r = similarTo(base, 12, seen);
        return r.length ? [{ base, r }] : [];
      }),
    [history], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const hero = byTrending()[0];
  const filter = (l: MediaItem[]) => (type === "all" ? l : l.filter((m) => m.type === type));
  const results = q.trim() ? filter(searchCatalog(q)) : [];
  const rowProps = { size, wl, onToggle: toggle };
  const watchlist = wl.map((k) => SAMPLE_CATALOG.find((m) => titleKey(m.type, m.id) === k)).filter(Boolean) as MediaItem[];

  const open = (h: ProgressEntry) => nav({ to: "/watch", search: { type: h.type, id: h.id } });
  const surprise = () => {
    const m = SAMPLE_CATALOG[Math.floor(Math.random() * SAMPLE_CATALOG.length)];
    nav({ to: "/watch", search: { type: m.type, id: m.id } });
  };

  return (
    <div className="min-h-screen">
      <AppHeader settings={settings} update={update} />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6 lg:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-glow">
          <div className="bg-poster absolute inset-0 opacity-60" />
          <div className="relative max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Trending now</p>
            <h1 className="text-3xl font-bold sm:text-5xl">{hero.title}</h1>
            <p className="line-clamp-3 text-sm text-muted-foreground sm:text-base">{hero.overview}</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/watch" search={{ type: hero.type, id: hero.id }} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110">
                <Play className="h-4 w-4 fill-current" /> Watch now
              </Link>
              <button onClick={surprise} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Shuffle className="h-4 w-4" /> Surprise me
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles or genres" aria-label="Search"
              className="w-full rounded-full border border-input bg-background/80 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
          </label>
          <div role="radiogroup" aria-label="Type" className="flex gap-1 rounded-full bg-muted p-1">
            {(["all", "movie", "tv", "anime"] as const).map((t) => (
              <button key={t} role="radio" aria-checked={type === t} onClick={() => setType(t)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold capitalize text-muted-foreground aria-checked:bg-primary aria-checked:text-primary-foreground">
                {t === "tv" ? "Series" : t}
              </button>
            ))}
          </div>
        </div>

        {q.trim() ? (
          results.length ? <Row title={`Results for "${q}"`} items={results} {...rowProps} /> : <p className="text-sm text-muted-foreground">No matches in the library. Try the Player page to play by TMDB ID.</p>
        ) : (
          <>
            <ContinueWatching items={history} onPick={open} onRemove={remove} onClear={clear} />
            {because.map(({ base, r }) => (
              <Row key={base.id} title={`Because you watched ${base.title}`} items={filter(r)} {...rowProps} />
            ))}
            <Row title="My list" items={filter(watchlist)} {...rowProps} />
            <Row title="Trending today" items={filter(byTrending()).slice(0, 12)} {...rowProps} />
            <Row title="Most popular" items={filter(byPopular()).slice(0, 12)} {...rowProps} />
            <section>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="mr-2 text-lg font-semibold">Available on</h2>
                {SERVICES.map((s) => (
                  <button key={s} aria-pressed={svc === s} onClick={() => setSvc(s)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">
                    {s}
                  </button>
                ))}
              </div>
              <Row title="" items={filter(onService(svc))} {...rowProps} />
            </section>
            <Row title="Trending anime" items={byTrending().filter((m) => m.type === "anime")} {...rowProps} />
            <Row title="Binge-worthy series" items={ofType("tv")} {...rowProps} />
            <Row title="Movie night" items={ofType("movie")} {...rowProps} />
          </>
        )}

        <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
          PriView · Library data is sample data until a TMDB key is connected. Only watch content you're authorised to access.
        </footer>
      </main>
    </div>
  );
}
