"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";
import { useTacticalStream, type StreamStatus } from "@/lib/websocket";
import { api } from "@/lib/api";
import type {
  AttackerProfile,
  ChainIntegrity,
  ExecutionSource,
  ForensicBlock,
  ForensicIntegrityAlert,
  HoneytokenTriggered,
  ImmunityBroadcasted,
  InterceptionAlert,
  KodamNode,
  KodamStatus,
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

  const sessionToken = snapshot?.sessions[0]?.session_id ?? sessions[0]?.session_id ?? "ses-kdm03-9941a";

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
        const al = env.payload as InterceptionAlert;
        setAlert(al);
        setSessions((prev) => {
          const currentSid = "ses-kdm03-9941a";
          const exists = prev.some((s) => s.session_id === currentSid);
          if (exists) {
            return prev.map((s) =>
              s.session_id === currentSid
                ? {
                    ...s,
                    threat_score: al.threat_score,
                    entry_vector: al.entry_vector,
                    routing_mode: al.routing_mode,
                  }
                : s
            );
          }
          const newSession: SessionState = {
            session_id: currentSid,
            threat_score: al.threat_score,
            entry_vector: al.entry_vector,
            routing_mode: al.routing_mode,
            status: "ACTIVE",
            started_at: new Date().toISOString(),
            cwd: "/opt/satcom",
            attacker_profile: al.attacker_profile,
          };
          return [newSession, ...prev];
        });
        break;
      }
      case "OT_SABOTAGE_ATTEMPT": {
        setOt(env.payload as OTSabotageAttempt);
        break;
      }
      case "TERMINAL_COMMAND_EXECUTED": {
        const item = env.payload as TerminalCommandExecuted;
        setTerminalHistory((prev) => {
          if (prev.some((x) => x.command_id === item.command_id)) return prev;
          return [...prev, item];
        });
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
        const ht = env.payload as HoneytokenTriggered;
        setHoneypot(ht);
        break;
      }
      case "IMMUNITY_BROADCASTED": {
        const imm = env.payload as ImmunityBroadcasted;
        setBroadcast(imm);
        if (imm.kodam_nodes_status && imm.kodam_nodes_status.length > 0) {
          setKodamNodes(imm.kodam_nodes_status);
        } else {
          setKodamNodes((prev) =>
            prev.map((k) => ({ ...k, status: "IMMUNE_PROTECTED" as KodamStatus }))
          );
        }
        break;
      }
      case "FORENSIC_INTEGRITY_ALERT": {
        const fia = env.payload as ForensicIntegrityAlert;
        setIntegrity(fia.chain_integrity);
        if (fia.chain_integrity === "VALID_IMMUTABLE") {
          setLedger((prev) =>
            prev.map((b) => ({
              ...b,
              chain_integrity: "VALID_IMMUTABLE" as ChainIntegrity,
              tampered_block_index: null,
            }))
          );
        } else {
          setLedger((prev) =>
            prev.map((b) =>
              b.block_index === (fia.tampered_block_index ?? fia.block_index)
                ? {
                    ...b,
                    chain_integrity: fia.chain_integrity,
                    tampered_block_index: fia.tampered_block_index ?? fia.block_index,
                  }
                : b
            )
          );
        }
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
        const item: TerminalCommandExecuted = {
          command_id: res.command_id || `cmd-${Date.now()}`,
          cwd: res.cwd,
          prompt: res.prompt,
          raw_input: raw,
          simulated_output: res.output,
          execution_source: (res.execution_source as ExecutionSource) || "VFS_DETERMINISTIC_ENGINE",
          response_time_ms: 0,
        };
        setTerminalHistory((prev) => {
          if (prev.some((x) => x.command_id === item.command_id)) return prev;
          return [...prev, item];
        });
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
    window.open(api.exportPdfUrl(sessionToken), "_blank");
  }, [sessionToken]);

  const handleImmunityBroadcast = useCallback(async () => {
    setCommandBusy(true);
    try {
      const res = await api.immunityBroadcast(sessionToken);
      if (res && res.rule) {
        setBroadcast({
          broadcast_active: true,
          generated_rule: {
            rule_id: res.rule.rule_id,
            iptables_cmd: res.rule.iptables_cmd,
            modsec_rule: res.rule.modsec_rule,
          },
          kodam_nodes_status: kodamNodes.map((n) => ({
            ...n,
            status: "IMMUNE_PROTECTED" as KodamStatus,
          })),
        });
        setKodamNodes((prev) =>
          prev.map((n) => ({ ...n, status: "IMMUNE_PROTECTED" as KodamStatus }))
        );
      }
    } catch (err) {
      console.error("Gagal menyebarkan vaksinasi herd immunity:", err);
    } finally {
      setCommandBusy(false);
    }
  }, [sessionToken, kodamNodes]);

  const threatScore = alert?.threat_score ?? sessions[0]?.threat_score ?? 0;
  const integrityBad = integrity === "TAMPERED_CRITICAL";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="font-mono text-lg font-bold tracking-widest text-slate-100 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-400" />
              C4ISR COMMAND CENTER // CAKRA-DECOY 2.0
            </h1>
            <p className="font-mono text-[10px] tracking-[0.25em] text-slate-400">
              PUSSIBERAD // PUSAT SIBER TNI ANGKATAN DARAT
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/target-portal"
              target="_blank"
              className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-300 hover:border-emerald-500 hover:text-emerald-300 transition"
            >
              <ExternalLink className="h-3 w-3" />
              Buka Target Portal
            </Link>

            <span
              className={`flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${
                streamStatus === "live"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  streamStatus === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              WS: {streamStatus}
            </span>

            <span
              className={`rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest font-bold ${
                threatScore >= 70
                  ? "border-rose-500/50 bg-rose-500/20 text-rose-300"
                  : threatScore >= 40
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                    : "border-slate-700 bg-slate-800/40 text-slate-300"
              }`}
            >
              SKOR ANCAMAN: {threatScore}/100
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {alert && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              alert.threat_score >= 70
                ? "border-rose-500/50 bg-rose-500/10"
                : "border-amber-500/50 bg-amber-500/10"
            }`}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400 animate-pulse" />
            <div className="font-mono text-xs text-slate-200">
              <span className="font-semibold uppercase tracking-widest text-rose-300">
                INTERCEPTION_ALERT // PENYESATAN SENYAP AKTIF (AI MIRROR-TWIN)
              </span>
              <p className="mt-1 leading-relaxed">
                Skor ancaman <span className="font-bold text-rose-300">{alert.threat_score}</span> via vektor{" "}
                <span className="text-amber-300 font-semibold">{alert.entry_vector}</span>. Latensi pencegatan:{" "}
                <span className="text-emerald-300 font-mono">{(alert.interception_latency_ms ?? 0.8).toFixed(1)}ms</span> (Di bawah threshold 1.2ms).
                Sesi penyerang dialihkan 100% ke sandbox AI Mirror-Twin tanpa memutuskan koneksi TCP.
              </p>
            </div>
          </div>
        )}

        {ot && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 shadow-lg">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400 animate-pulse" />
            <div className="font-mono text-xs text-slate-200">
              <span className="font-semibold uppercase tracking-widest text-amber-300">
                PERCOBAAN SABOTASE SCADA // ILUSI KENDALI BERHASIL
              </span>
              <p className="mt-1 leading-relaxed">
                Penyerang mengoverride tegangan pendingin radar ke{" "}
                <span className="font-bold text-rose-400">{ot.decoy_radar_temp_c.toFixed(1)}°C (ALARM ILUSI)</span>.
                Sistem riil Komando Pertahanan tetap beroperasi aman di{" "}
                <span className="font-bold text-emerald-400">{ot.real_radar_temp_c.toFixed(1)}°C (NOMINAL PROTECTED)</span>.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttackGraph sessions={sessions} alert={alert} />
          </div>

          <TacticalMap
            kodamNodes={kodamNodes}
            honeytoken={honeypot}
            onImmunityBroadcast={handleImmunityBroadcast}
            broadcast={broadcast}
            busy={commandBusy}
          />

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
          <div className="mt-4 flex items-center justify-between rounded border border-rose-500/60 bg-rose-500/20 px-4 py-3 font-mono text-xs text-rose-200 shadow-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>
                INTEGRITAS BUKTI HUKUM: <strong>TAMPERED_CRITICAL</strong> — Terdeteksi anomali pada rantai hash SHA-256 (Pasal 5 &amp; 6 UU ITE).
              </span>
            </div>
            <button
              onClick={handleRestore}
              className="rounded border border-emerald-500/60 bg-emerald-500/30 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-200 hover:bg-emerald-500/40"
            >
              Pulihkan Rantai Hash
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
