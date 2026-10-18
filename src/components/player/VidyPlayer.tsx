import { useEffect, useRef, useState } from "react";
import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";
import { IFRAME_ALLOW, parsePlayerMessage, type PlayerEvent } from "@/lib/vidy";

interface Props {
  src: string;
  title: string;
  onEvent: (e: PlayerEvent) => void;
}

type Status = "loading" | "ready" | "timeout" | "offline";
const LOAD_TIMEOUT_MS = 20000;

export function VidyPlayer({ src, title, onEvent }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [nonce, setNonce] = useState(0);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
      return;
    }
    setStatus("loading");
    const t = window.setTimeout(() => setStatus((s) => (s === "loading" ? "timeout" : s)), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [src, nonce]);

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      // Only accept messages from our own iframe window and a Vidy origin.
      if (ev.source !== frameRef.current?.contentWindow) return;
      const parsed = parsePlayerMessage(ev.origin, ev.data);
      if (parsed) onEventRef.current(parsed);
    };
    const offline = () => setStatus("offline");
    window.addEventListener("message", handler);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("message", handler);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const retry = () => setNonce((n) => n + 1);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-stage shadow-glow">
      {status !== "offline" && (
        <iframe
          key={`${src}#${nonce}`}
          ref={frameRef}
          src={src}
          title={`Player: ${title}`}
          className="absolute inset-0 h-full w-full"
          allow={IFRAME_ALLOW}
          allowFullScreen
          referrerPolicy="origin"
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("timeout")}
        />
      )}

      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-stage" aria-live="polite">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-14 w-14">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
              <span className="absolute inset-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="text-sm text-muted-foreground">Loading {title}…</p>
          </div>
        </div>
      )}

      {(status === "timeout" || status === "offline") && (
        <div className="absolute inset-0 grid place-items-center bg-stage p-6 text-center" role="alert">
          <div className="flex max-w-sm flex-col items-center gap-3">
            {status === "offline" ? (
              <WifiOff className="h-10 w-10 text-primary" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-primary" />
            )}
            <h3 className="text-lg font-semibold">
              {status === "offline" ? "You're offline" : "Player didn't respond"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {status === "offline"
                ? "Check your connection and try again."
                : "This title may be unavailable, or the network is slow. Check the ID and try again."}
            </p>
            <button
              onClick={retry}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
