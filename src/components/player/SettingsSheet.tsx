import { Settings2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Settings } from "@/lib/store";

const SWATCHES = ["#E11D48", "#F97316", "#EAB308", "#22C55E", "#06B6D4", "#3B82F6", "#FFFFFF"];

interface Props {
  settings: Settings;
  update: (p: Partial<Settings>) => void;
}

const TOGGLES: { key: keyof Settings; label: string; hint: string }[] = [
  { key: "autoplay", label: "Autoplay", hint: "Starts with sound when the browser allows it." },
  { key: "resume", label: "Resume where I left off", hint: "Starts from your saved position." },
  { key: "nextEpisode", label: "Next episode button", hint: "Series and anime only." },
  { key: "episodeSelector", label: "In-player episode picker", hint: "Series and anime only." },
  { key: "autoplayNextEpisode", label: "Auto-play next episode", hint: "Continues when an episode ends." },
];

export function SettingsSheet({ settings, update }: Props) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Settings"
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Settings2 className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-popover sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-display">Player settings</SheetTitle>
          <SheetDescription>Saved on this device.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-8 px-4">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Accent colour</h3>
            <div className="flex flex-wrap items-center gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  aria-label={`Accent ${c}`}
                  aria-pressed={settings.accent.toUpperCase() === c}
                  onClick={() => update({ accent: c })}
                  style={{ backgroundColor: c }}
                  className="h-8 w-8 rounded-full border-2 border-border transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-foreground"
                />
              ))}
              <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border" aria-label="Custom colour">
                <input
                  type="color"
                  value={settings.accent}
                  onChange={(e) => update({ accent: e.target.value.toUpperCase() })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </section>
          <section className="space-y-5">
            {TOGGLES.map((t) => (
              <div key={t.key} className="flex items-start justify-between gap-4">
                <Label htmlFor={t.key} className="flex flex-col items-start gap-1">
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">{t.hint}</span>
                </Label>
                <Switch
                  id={t.key}
                  checked={Boolean(settings[t.key])}
                  onCheckedChange={(v) => update({ [t.key]: v } as Partial<Settings>)}
                />
              </div>
            ))}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
