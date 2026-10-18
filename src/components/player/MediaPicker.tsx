import { useState } from "react";
import { Play } from "lucide-react";
import type { MediaType } from "@/lib/vidy";

interface Props {
  onSubmit: (type: MediaType, id: number) => void;
}

const TYPES: { value: MediaType; label: string; idLabel: string }[] = [
  { value: "movie", label: "Movie", idLabel: "TMDB ID" },
  { value: "tv", label: "Series", idLabel: "TMDB ID" },
  { value: "anime", label: "Anime", idLabel: "AniList ID" },
];

export function MediaPicker({ onSubmit }: Props) {
  const [type, setType] = useState<MediaType>("movie");
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const meta = TYPES.find((t) => t.value === type)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = raw.trim();
    if (!/^\d{1,9}$/.test(trimmed) || Number(trimmed) <= 0) {
      setError(`Enter a valid ${meta.idLabel} (whole number).`);
      return;
    }
    setError(null);
    onSubmit(type, Number(trimmed));
    setRaw("");
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4">
      <div role="radiogroup" aria-label="Media type" className="mb-3 grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={type === t.value}
            onClick={() => setType(t.value)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition aria-checked:bg-primary aria-checked:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="media-id">{meta.idLabel}</label>
        <input
          id="media-id"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={meta.idLabel}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none transition focus:border-primary aria-invalid:border-destructive"
        />
        <button
          type="submit"
          aria-label="Play"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}
