import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Panel, type PanelFocus } from "@/components/ui/Panel";
import type { TacticalState } from "@/lib/tactical-state";

export interface LedgerPanelProps {
  state: TacticalState;
  focus?: PanelFocus;
  /** Pemanggil yang menentukan blok target (milik sesi aktif). */
  onTamper?: () => void;
  onRestore?: () => void;
  onExportPdf?: () => void;
}

export function LedgerPanel({
  state,
  focus,
  onTamper,
  onRestore,
  onExportPdf,
}: LedgerPanelProps) {
  const tampered = state.integrity === "TAMPERED_CRITICAL";
  return (
    <Panel
      eyebrow="SHA-256 hash-chain"
      title="Ledger bukti forensik"
      focus={focus}
      action={
        <span
          className={`flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-semibold ${
            tampered
              ? "border-hostile text-hostile"
              : "border-safe/50 text-safe"
          }`}
        >
          <Icon
            name={
              tampered
                ? "danger-triangle-bold-duotone"
                : "shield-check-bold-duotone"
            }
            className="h-3.5 w-3.5"
          />
          {tampered ? "Rantai rusak" : "Rantai utuh"}
        </span>
      }
    >
      <ol className="max-h-[420px] space-y-1.5 overflow-y-auto">
        {state.ledger.length === 0 && (
          <li className="text-sm text-ink-mute">Ledger kosong.</li>
        )}
        {state.ledger.map((b) => {
          const bad = b.chain_integrity === "TAMPERED_CRITICAL";
          return (
            <li
              key={`${b.block_index}-${b.current_hash}`}
              className={`grid grid-cols-[2.5rem_1fr] gap-x-3 rounded-sm px-3 py-2 ${bad ? "bg-hostile/10" : "bg-panel-2"}`}
            >
              <span
                className={`font-data text-sm ${bad ? "text-hostile" : "text-ink-mute"}`}
              >
                #{b.block_index}
              </span>
              <span className="min-w-0">
                <span className="block break-words text-sm text-ink">
                  {b.action_summary}
                </span>
                <span className="block truncate font-data text-xs text-ink-mute">
                  {b.current_hash}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {(onTamper || onRestore || onExportPdf) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {onTamper && (
            <Button variant="danger" onClick={onTamper}>
              Uji manipulasi
            </Button>
          )}
          {onRestore && (
            <Button variant="ghost" onClick={onRestore}>
              Pulihkan rantai
            </Button>
          )}
          {onExportPdf && (
            <Button variant="ghost" onClick={onExportPdf}>
              <Icon
                name="download-minimalistic-bold-duotone"
                className="h-4 w-4"
              />{" "}
              Laporan PDF
            </Button>
          )}
        </div>
      )}
    </Panel>
  );
}
