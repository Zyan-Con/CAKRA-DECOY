import type { StreamStatus } from "@/lib/websocket";

const LABEL: Record<StreamStatus, { text: string; tone: string }> = {
  live: { text: "Terhubung", tone: "bg-safe" },
  connecting: { text: "Menghubungkan", tone: "bg-ink-mute" },
  reconnecting: { text: "Menyambung ulang", tone: "bg-ink-mute" },
  offline: { text: "Terputus dari server", tone: "bg-hostile" },
};

/** Status koneksi WebSocket ke backend. */
export function StreamBadge({ status }: { status: StreamStatus }) {
  const s = LABEL[status];
  return (
    <span className="flex items-center gap-2 text-sm text-ink-soft" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${s.tone}`} aria-hidden />
      {s.text}
    </span>
  );
}
