// Vidy embed helpers — built strictly from the documented routes, query flags
// and postMessage events at https://www.vidy.st/ (no undocumented endpoints).

export const VIDY_BASE = "https://vidy.st";
/** Origins allowed to send postMessage events to this page. */
export const VIDY_ORIGINS = ["https://vidy.st", "https://www.vidy.st"];
export const IFRAME_ALLOW = "encrypted-media; autoplay *; fullscreen *";

export type MediaType = "movie" | "tv" | "anime";

export interface EmbedTarget {
  type: MediaType;
  id: number;
  season?: number;
  episode?: number;
}

export interface EmbedOptions {
  color?: string; // 6-digit hex, with or without #
  progress?: number; // seconds
  autoplay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  autoplayNextEpisode?: boolean;
}

export function isValidId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value < 1e10;
}

export function normalizeHex(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const hex = color.replace(/^#/, "").toUpperCase();
  return /^[0-9A-F]{6}$/.test(hex) ? hex : undefined;
}

export function buildEmbedUrl(target: EmbedTarget, opts: EmbedOptions = {}): string {
  if (!isValidId(target.id)) throw new Error("Invalid media id");
  const season = isValidId(target.season) ? target.season : 1;
  const episode = isValidId(target.episode) ? target.episode : 1;

  let path: string;
  if (target.type === "movie") path = `/movie/${target.id}`;
  else if (target.type === "tv") path = `/tv/${target.id}/${season}/${episode}`;
  else path = `/anime/${target.id}/${episode}`;

  const params = new URLSearchParams();
  const color = normalizeHex(opts.color);
  if (color) params.set("color", color);
  if (opts.progress && opts.progress > 0) params.set("progress", String(Math.floor(opts.progress)));
  if (opts.autoplay) params.set("autoplay", "true");
  if (target.type !== "movie") {
    if (opts.nextEpisode) params.set("nextEpisode", "true");
    if (opts.episodeSelector) params.set("episodeSelector", "true");
    if (opts.autoplayNextEpisode) params.set("autoplayNextEpisode", "true");
  }
  const qs = params.toString();
  return `${VIDY_BASE}${path}${qs ? `?${qs}` : ""}`;
}

export type PlayerEventName = "timeupdate" | "play" | "pause" | "ended";

export interface PlayerEvent {
  kind: "player";
  event: PlayerEventName;
  currentTime: number;
  duration: number;
}

const EVENTS: PlayerEventName[] = ["timeupdate", "play", "pause", "ended"];

/**
 * Validate origin + payload of an incoming message. Returns null for anything
 * that is not a well-formed Vidy PLAYER_EVENT from an allowed origin.
 */
export function parsePlayerMessage(origin: string, data: unknown): PlayerEvent | null {
  if (!VIDY_ORIGINS.includes(origin)) return null;
  if (typeof data !== "string" || data.length > 100_000) return null;
  let payload: unknown;
  try {
    payload = JSON.parse(data);
  } catch {
    return null;
  }
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  // Events may arrive flat or wrapped as { type: "PLAYER_EVENT", data: {...} }
  const body =
    p.type === "PLAYER_EVENT" && p.data && typeof p.data === "object"
      ? (p.data as Record<string, unknown>)
      : p;
  const event = body.event;
  if (typeof event !== "string" || !EVENTS.includes(event as PlayerEventName)) return null;
  const currentTime = Number(body.currentTime);
  const duration = Number(body.duration);
  if (!Number.isFinite(currentTime) || currentTime < 0) return null;
  return {
    kind: "player",
    event: event as PlayerEventName,
    currentTime,
    duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
  };
}
