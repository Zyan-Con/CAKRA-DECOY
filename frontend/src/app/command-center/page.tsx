"use client";

import { useCallback, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTacticalStream, type StreamStatus } from "@/lib/websocket";
import { api } from "@/lib/api";
import type {
  AttackerProfile,
  ChainIntegrity,
  ForensicBlock,
  ForensicIntegrityAlert,
  HoneytokenTriggered,
  ImmunityBroadcasted,
  InterceptionAlert,
  KodamNode,
  MitreEnrichment,
  OTSabotageAttempt,
  SessionState,
  StateSnapshot,
  TerminalCommandExecuted,
} from "@/lib/types";
import type { TacticalEnvelope } from "@/lib/types";
import AttackGraph from "@/components/AttackGraph";
import ForensicTable from "@/components/ForensicTable";
import LiveTerminalSpy from "@/components/LiveTerminalSpy";
import MitreMatrix from "@/components/MitreMatrix";
import TacticalMap from "@/components/TacticalMap";

export default function CommandCenterPage() {
  const [snapshot, setSnapshot] = useState<StateSnapshot | null>(null);
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [alert, setAlert] = useState<InterceptionAlert | null>(null);
  const [ot, setOt] = useState<OTSabotageAttempt | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<TerminalCommandExecuted[]>(
    [],
  );
  const [mitreTechniques, setMitreTechniques] = useState<MitreEnrichment[]>([]);
  const [mitreProfile, setMitreProfile] = useState<AttackerProfile | null>(null);
  const [honeypot, setHoneypot] = useState<HoneytokenTriggered | null>(null);
  const [kodamNodes, setKodamNodes] = useState<KodamNode[]>([]);
  const [broadcast, setBroadcast] = useState<ImmunityBroadcasted | null>(null);
  const [ledger, setLedger] = useState<ForensicBlock[]>([]);
  const [integrity, setIntegrity] = useState<ChainIntegrity>("VALID_IMMUTABLE");
  const [commandBusy, setCommandBusy] = useState(false);

  const sessionToken = snapshot?.sessions[0]?.session_id ?? "ses-kdm03-9941a";

  const handleEvent = useCallback((env: TacticalEnvelope) => {
    switch (env.event_type) {
      case "INITIAL_STATE_SYNC": {
        const snap = env.payload as StateSnapshot;
        setSnapshot(snap);
        setSessions(snap.sessions);
        setTerminalHistory(snap.terminal_history);
        setMitreTechniques(snap.mitre_techniques);
        setKodamNodes(snap.kodam_nodes);
        setLedger(snap.forensic_ledger);
        setIntegrity(
          snap.forensic_ledger[0]?.chain_integrity ?? "VALID_IMMUTABLE",
        );
        break;
      }
      case "INTERCEPTION_ALERT": {
        setAlert(env.payload as InterceptionAlert);
        break;
      }
      case "OT_SABOTAGE_ATTEMPT": {
        setOt(env.payload as OTSabotageAttempt);
        break;
      }
      case "TERMINAL_COMMAND_EXECUTED": {
        setTerminalHistory((prev) => [
          ...prev,
          env.payload as TerminalCommandExecuted,
        ]);
        break;
      }
      case "MITRE_ENRICHMENT_READY": {
        const t = env.payload as MitreEnrichment;
        setMitreTechniques((prev) => [
          t,
          ...prev.filter((x) => x.technique_id !== t.technique_id),
        ]);
        setMitreProfile(t.attacker_profile ?? null);
        break;
      }
      case "HONEYTOKEN_TRIGGERED": {
        setHoneypot(env.payload as HoneytokenTriggered);
        break;
      }
      case "IMMUNITY_BROADCASTED": {
        const imm = env.payload as ImmunityBroadcasted;
        setBroadcast(imm);
        setKodamNodes(imm.kodam_nodes_status);
        break;
      }
      case "FORENSIC_INTEGRITY_ALERT": {
        const fia = env.payload as ForensicIntegrityAlert;
        setIntegrity(fia.chain_integrity);
        setLedger((prev) =>
          prev.map((b) =>
            b.block_index === fia.block_index
              ? {
                  ...b,
                  chain_integrity: fia.chain_integrity,
                  tampered_block_index:
                    fia.tampered_block_index ?? b.block_index,
                }
              : b,
          ),
        );
        break;
      }
      default:
        break;
    }
  }, []);

  const streamStatus = useTacticalStream(handleEvent);

  const executeCommand = useCallback(
    async (raw: string) => {
      if (!sessionToken) return;
      setCommandBusy(true);
      try {
        const res = await api.sysConsole(sessionToken, raw);
        setTerminalHistory((prev) => [
          ...prev,
          {
            command_id: `cmd-${Date.now()}`,
            cwd: res.cwd,
            prompt: res.prompt,
            raw_input: raw,
            simulated_output: res.output,
            execution_source: "VFS_DETERMINISTIC_ENGINE",
            response_time_ms: 0,
          },
        ]);
      } catch {
        // abaikan kegagalan lokal — stream tetap hidup
      } finally {
        setCommandBusy(false);
      }
    },
    [sessionToken],
  );

  const handleTamper = useCallback(async () => {
    await api.tamperTest(1);
  }, []);

  const handleRestore = useCallback(async () => {
    await api.restoreLedger();
  }, []);

  const handleExportPdf = useCallback(() => {
    window.location.href = api.exportPdfUrl(sessionToken);
  }, [sessionToken]);

  const threatScore = alert?.threat_score ?? sessions[0]?.threat_score ?? 0;
  const integrityBad = integrity === "TAMPERED_CRITICAL";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="font-mono text-lg font-bold tracking-widest text-slate-100">
              C4ISR COMMAND CENTER
            </h1>
            <p className="font-mono text-[10px] tracking-[0.25em] text-slate-500">
              PUSSIBERAD // PUSAT SIBER TNI AD
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${
                streamStatus === "live"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  streamStatus === "live" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              WS: {streamStatus}
            </span>
            <span className="rounded border border-slate-700 bg-slate-800/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-300">
              THREAT {threatScore}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {alert && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 ${
              alert.threat_score >= 70
                ? "border-rose-500/50 bg-rose-500/10"
                : "border-amber-500/50 bg-amber-500/10"
            }`}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div className="font-mono text-xs text-slate-200">
              <span className="font-semibold uppercase tracking-widest text-rose-300">
                INTERCEPTION_ALERT // DECOY_MIRROR_TWIN
              </span>
              <p className="mt-1">
                Threat score {alert.threat_score} via {alert.entry_vector}. Interceptor
                latency {(alert.interception_latency_ms ?? 0).toFixed(1)}ms — session
                dialihkan ke sandbox AI Mirror-Twin.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttackGraph sessions={sessions} alert={alert} />
          </div>
          <TacticalMap kodamNodes={kodamNodes} honeytoken={honeypot} />

          <div className="lg:col-span-3">
            <LiveTerminalSpy
              history={terminalHistory}
              onCommand={executeCommand}
              session={sessions[0] ?? null}
            />
          </div>

          <MitreMatrix techniques={mitreTechniques} profile={mitreProfile} />

          <ForensicTable
            blocks={ledger}
            onTamper={handleTamper}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
          />
        </div>

        {integrityBad && (
          <p className="mt-4 rounded border border-rose-500/40 bg-rose-500/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-rose-300">
            // RANTAI BUKTI SHA-256: TAMPERED_CRITICAL — SELAMATNYA JANGAN ABAIKAN
          </p>
        )}
      </div>
    </main>
  );
}
