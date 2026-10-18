import { describe, expect, it } from "vitest";
import { buildEmbedUrl, parsePlayerMessage } from "./vidy";

describe("buildEmbedUrl", () => {
  it("builds the movie route with color and progress", () => {
    expect(buildEmbedUrl({ type: "movie", id: 315162 }, { color: "#22c55e", progress: 90 })).toBe(
      "https://vidy.st/movie/315162?color=22C55E&progress=90",
    );
  });
  it("builds the tv route with episode flags", () => {
    expect(
      buildEmbedUrl(
        { type: "tv", id: 1396, season: 1, episode: 1 },
        { nextEpisode: true, episodeSelector: true, autoplayNextEpisode: true },
      ),
    ).toBe("https://vidy.st/tv/1396/1/1?nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true");
  });
  it("defaults anime episode to 1 and drops episode flags for movies", () => {
    expect(buildEmbedUrl({ type: "anime", id: 21 })).toBe("https://vidy.st/anime/21/1");
    expect(buildEmbedUrl({ type: "movie", id: 5 }, { nextEpisode: true })).toBe("https://vidy.st/movie/5");
  });
  it("rejects invalid ids", () => {
    expect(() => buildEmbedUrl({ type: "movie", id: -3 })).toThrow();
  });
});

describe("parsePlayerMessage", () => {
  const msg = JSON.stringify({ event: "timeupdate", currentTime: 12, duration: 100 });
  it("accepts a valid event from vidy", () => {
    expect(parsePlayerMessage("https://vidy.st", msg)?.currentTime).toBe(12);
  });
  it("rejects other origins and malformed payloads", () => {
    expect(parsePlayerMessage("https://evil.example", msg)).toBeNull();
    expect(parsePlayerMessage("https://vidy.st", "{bad")).toBeNull();
    expect(parsePlayerMessage("https://vidy.st", JSON.stringify({ event: "hack" }))).toBeNull();
  });
});
