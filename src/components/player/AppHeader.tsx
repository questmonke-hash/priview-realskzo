import { Link } from "@tanstack/react-router";
import { Eye, Play } from "lucide-react";
import { SettingsSheet } from "@/components/player/SettingsSheet";
import type { Settings } from "@/lib/store";

export function AppHeader({ settings, update }: { settings: Settings; update: (p: Partial<Settings>) => void }) {
  const nav = "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground";
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Eye className="h-5 w-5" />
            <Play className="absolute h-2 w-2 fill-current" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Pri<span className="text-primary">View</span>
          </span>
        </Link>
        <nav className="ml-2 hidden gap-1 sm:flex">
          <Link to="/" className={nav} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/watch" className={nav} activeProps={{ className: "text-foreground" }}>Player</Link>
        </nav>
        <div className="ml-auto"><SettingsSheet settings={settings} update={update} /></div>
      </div>
    </header>
  );
}
