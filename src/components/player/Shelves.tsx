import { X } from "lucide-react";
import type { MediaItem } from "@/lib/catalog";
import type { ProgressEntry } from "@/lib/store";

export function Poster({ title, className = "" }: { title: string; className?: string }) {
  const initials = title.split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  return (
    <div className={`bg-poster relative grid place-items-center overflow-hidden ${className}`}>
      <span className="font-display text-3xl font-bold text-foreground/80">{initials}</span>
    </div>
  );
}

const typeLabel = { movie: "Movie", tv: "Series", anime: "Anime" } as const;

export function ContinueWatching({
  items,
  onPick,
  onRemove,
  onClear,
}: {
  items: ProgressEntry[];
  onPick: (e: ProgressEntry) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
}) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="cw" className="animate-reel">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="cw" className="text-lg font-semibold">Continue watching</h2>
        <button onClick={onClear} className="text-xs text-muted-foreground transition hover:text-foreground">
          Clear all
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((e) => {
          const pct = e.duration ? Math.min(100, (e.currentTime / e.duration) * 100) : 0;
          return (
            <div key={e.key} className="group relative w-56 shrink-0">
              <button
                onClick={() => onPick(e)}
                className="block w-full overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Poster title={e.title} className="aspect-video" />
                <div className="h-1 bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.type === "movie" ? typeLabel.movie : e.type === "tv" ? `S${e.season} · E${e.episode}` : `Episode ${e.episode}`}
                    {e.duration ? ` · ${Math.max(0, Math.round((e.duration - e.currentTime) / 60))}m left` : ""}
                  </p>
                </div>
              </button>
              <button
                aria-label={`Remove ${e.title}`}
                onClick={() => onRemove(e.key)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Library({ items, onPick, activeKey }: { items: MediaItem[]; onPick: (m: MediaItem) => void; activeKey: string }) {
  return (
    <section aria-labelledby="lib">
      <h2 id="lib" className="mb-3 text-lg font-semibold">Library</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((m) => {
          const active = `${m.type}:${m.id}` === activeKey;
          return (
            <button
              key={`${m.type}-${m.id}`}
              onClick={() => onPick(m)}
              aria-current={active}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=true]:border-primary"
            >
              <Poster title={m.title} className="aspect-[2/3] transition group-hover:brightness-110" />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{m.title}</p>
                <p className="text-xs text-muted-foreground">{typeLabel[m.type]} · {m.year}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
