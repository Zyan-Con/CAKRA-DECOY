"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/lib/icon";
import { useTacticalStream } from "@/lib/websocket";
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
  TacticalEnvelope,
  TerminalCommandExecuted,
} from "@/lib/types";
import AttackGraph from "@/components/AttackGraph";
import ForensicTable from "@/components/ForensicTable";
import LiveTerminalSpy from "@/components/LiveTerminalSpy";
import MitreMatrix from "@/components/MitreMatrix";
import TacticalMap from "@/components/TacticalMap";

const STREAM: Record<string, { text: string; dot: string; tone: string }> = {
  live: { text: "LIVE", dot: "dot-live", tone: "text-accent-line" },
  connecting: { text: "CONNECTING", dot: "dot-warn", tone: "text-amber-200" },
  reconnecting: { text: "RECONNECTING", dot: "dot-warn", tone: "text-amber-200" },
  offline: { text: "OFFLINE", dot: "dot-danger", tone: "text-rose-200" },
};

export default function CommandCenterPage() {
  const [snapshot, setSnapshot] = useState<StateSnapshot | null>(null);
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [alert, setAlert] = useState<InterceptionAlert | null>(null);
  const [ot, setOt] = useState<OTSabotageAttempt | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<TerminalCommandExecuted[]>([]);
  const [mitreTechniques, setMitreTechniques] = useState<MitreEnrichment[]>([]);
  const [mitreProfile, setMitreProfile] = useState<AttackerProfile | null>(null);
  const [honeypot, setHoneypot] = useState<HoneytokenTriggered | null>(null);
  const [kodamNodes, setKodamNodes] = useState<KodamNode[]>([]);
  const [broadcast, setBroadcast] = useState<ImmunityBroadcasted | null>(null);
  const [ledger, setLedger] = useState<ForensicBlock[]>([]);
  const [integrity, setIntegrity] = useState<ChainIntegrity>("VALID_IMMUTABLE");
  const [commandBusy, setCommandBusy] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((s) => s.session_id === selectedSessionId) ?? sessions[0] ?? null,
    [sessions, selectedSessionId],
  );
  const sessionToken =
    activeSession?.session_id ?? snapshot?.sessions[0]?.session_id ?? "ses-kdm03-9941a";

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
        const hasTampered = snap.forensic_ledger.some(
          (b) => b.chain_integrity === "TAMPERED_CRITICAL",
        );
        setIntegrity(hasTampered ? "TAMPERED_CRITICAL" : "VALID_IMMUTABLE");
        if (snap.latest_alert) setAlert(snap.latest_alert);
        if (snap.latest_ot) setOt(snap.latest_ot);
        if (snap.latest_honeytoken) setHoneypot(snap.latest_honeytoken);
        if (snap.latest_immunity) setBroadcast(snap.latest_immunity);
        const initialProfile =
          snap.mitre_techniques[0]?.attacker_profile ??
          snap.sessions[0]?.attacker_profile ??
          snap.latest_alert?.attacker_profile ??
          null;
        if (initialProfile) setMitreProfile(initialProfile);
        break;
      }
      case "INTERCEPTION_ALERT": {
        const al = env.payload as InterceptionAlert;
        setAlert(al);
        const currentSid = env.session_id ?? "ses-kdm03-9941a";
        setSelectedSessionId(currentSid);
        setSessions((prev) => {
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
                : s,
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
        setKodamNodes((prev) =>
          prev.map((k) =>
            k.kodam_id === "KODAM-III" && k.status !== "IMMUNE_PROTECTED"
              ? { ...k, status: "UNDER_DECEPTION" as KodamStatus }
              : k,
          ),
        );
        break;
      }
      case "OT_SABOTAGE_ATTEMPT":
        setOt(env.payload as OTSabotageAttempt);
        break;
      case "TERMINAL_COMMAND_EXECUTED": {
        const item = env.payload as TerminalCommandExecuted;
        setTerminalHistory((prev) =>
          prev.some((x) => x.command_id === item.command_id) ? prev : [...prev, item],
        );
        if (env.session_id) {
          setSessions((prev) =>
            prev.map((s) => (s.session_id === env.session_id ? { ...s, cwd: item.cwd } : s)),
          );
        }
        break;
      }
      case "MITRE_ENRICHMENT_READY": {
        const t = env.payload as MitreEnrichment;
        setMitreTechniques((prev) => [t, ...prev.filter((x) => x.technique_id !== t.technique_id)]);
        if (t.attacker_profile) {
          setMitreProfile(t.attacker_profile);
          if (env.session_id) {
            setSessions((prev) =>
              prev.map((s) =>
                s.session_id === env.session_id
                  ? { ...s, attacker_profile: t.attacker_profile }
                  : s,
              ),
            );
          }
        }
        break;
      }
      case "HONEYTOKEN_TRIGGERED": {
        const ht = env.payload as HoneytokenTriggered;
        setHoneypot(ht);
        setSessions((prev) =>
          prev.map((s, idx) =>
            s.session_id === env.session_id || (!env.session_id && idx === 0)
              ? {
                  ...s,
                  real_leaked_ip: ht.real_leaked_ip,
                  apparent_ip: ht.apparent_proxy_ip,
                }
              : s,
          ),
        );
        break;
      }
      case "IMMUNITY_BROADCASTED": {
        const imm = env.payload as ImmunityBroadcasted;
        setBroadcast(imm);
        if (imm.kodam_nodes_status?.length) setKodamNodes(imm.kodam_nodes_status);
        else setKodamNodes((prev) => prev.map((k) => ({ ...k, status: "IMMUNE_PROTECTED" as KodamStatus })));
        break;
      }
      case "FORENSIC_INTEGRITY_ALERT": {
        const fia = env.payload as ForensicIntegrityAlert;
        setIntegrity(fia.chain_integrity);
        if (fia.ledger && fia.ledger.length > 0) {
          setLedger(fia.ledger);
        } else if (fia.chain_integrity === "VALID_IMMUTABLE") {
          setLedger((prev) =>
            prev.map((b) => ({
              ...b,
              chain_integrity: "VALID_IMMUTABLE" as ChainIntegrity,
              tampered_block_index: null,
            })),
          );
        } else {
          const bad = fia.tampered_block_index ?? fia.block_index;
          setLedger((prev) =>
            prev.map((b) =>
              b.block_index === bad
                ? { ...b, chain_integrity: fia.chain_integrity, tampered_block_index: bad }
                : b,
            ),
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
        setTerminalHistory((prev) =>
          prev.some((x) => x.command_id === item.command_id) ? prev : [...prev, item],
        );
      } catch {
        /* stream tetap hidup */
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
      if (res?.rule) {
        setBroadcast({
          broadcast_active: true,
          generated_rule: res.rule,
          kodam_nodes_status: kodamNodes.map((n) => ({ ...n, status: "IMMUNE_PROTECTED" as KodamStatus })),
        });
        setKodamNodes((prev) => prev.map((n) => ({ ...n, status: "IMMUNE_PROTECTED" as KodamStatus })));
      }
    } catch (err) {
      console.error("Gagal menyebarkan vaksin herd-immunity:", err);
    } finally {
      setCommandBusy(false);
    }
  }, [sessionToken, kodamNodes]);

  const threatScore = alert?.threat_score ?? sessions[0]?.threat_score ?? 0;
  const integrityBad = integrity === "TAMPERED_CRITICAL";
  const sm = STREAM[streamStatus] ?? STREAM.connecting;
  const immuneCount = useMemo(
    () => kodamNodes.filter((k) => k.status === "IMMUNE_PROTECTED").length,
    [kodamNodes],
  );

  return (
    <main className="min-h-screen">
      {/* Command bar navy (porsi sekunder 20%) */}
      <header className="sticky top-0 z-30 bg-ink text-white shadow-raised">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-accent-line">
            <Icon name="shield-checkered" className="h-5 w-5" />
          </span>
          <div className="mr-auto">
            <h1 className="text-sm font-semibold tracking-wide">C4ISR Command Center</h1>
            <p className="font-mono text-[10px] tracking-milli text-white/55">
              CAKRA-DECOY 2.0 · ACTIVE DECEPTION GATEWAY
            </p>
          </div>

          <span className={`flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] ${sm.tone}`}>
            <span className={`dot ${sm.dot}`} /> WS {sm.text}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] text-white/80">
            <Icon name="broadcast" className="h-3.5 w-3.5 text-accent-line" />
            KODAM {immuneCount}/{kodamNodes.length || 15}
          </span>
          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold ${
              threatScore >= 70
                ? "bg-rose-400/20 text-rose-100"
                : threatScore >= 40
                  ? "bg-amber-400/20 text-amber-100"
                  : "bg-white/10 text-white/80"
            }`}
          >
            <Icon name="gauge" className="h-3.5 w-3.5" /> THREAT {threatScore}/100
          </span>
          <Link
            href="/target-portal"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80 transition-colors hover:bg-white/20"
          >
            <Icon name="crosshair" className="h-3.5 w-3.5" /> Target Portal
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-6">
        {(alert || ot) && (
          <div className="mb-5 grid gap-3 lg:grid-cols-2">
            {alert && (
              <div className="card flex items-start gap-3 border-l-[3px] border-l-danger p-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-danger-weak text-danger">
                  <Icon name="warning-octagon" className="h-5 w-5" />
                </span>
                <div className="text-[13px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-danger">Interception · penyesatan senyap aktif</span>
                  <p className="mt-1">
                    Skor <span className="font-semibold text-danger">{alert.threat_score}</span> via{" "}
                    <span className="font-mono text-ink">{alert.entry_vector}</span>. Latensi pencegatan{" "}
                    <span className="font-mono font-semibold text-accent">{(alert.interception_latency_ms ?? 0).toFixed(2)} ms</span>.
                    Sesi dialihkan ke AI Mirror-Twin tanpa memutus koneksi TCP.
                  </p>
                </div>
              </div>
            )}
            {ot && (
              <div className="card flex items-start gap-3 border-l-[3px] border-l-warn p-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warn-weak text-warn">
                  <Icon name="thermometer-hot" className="h-5 w-5" />
                </span>
                <div className="text-[13px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-warn">Sabotase SCADA · ilusi kendali berhasil</span>
                  <p className="mt-1">
                    Penyerang melihat radar{" "}
                    <span className="font-semibold text-danger">{ot.decoy_radar_temp_c.toFixed(1)}°C</span> (ilusi). Sistem riil
                    tetap <span className="font-semibold text-accent">{ot.real_radar_temp_c.toFixed(1)}°C</span> (nominal, terlindungi).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AttackGraph
              sessions={sessions}
              alert={alert}
              selectedSessionId={activeSession?.session_id}
              onSelectSession={setSelectedSessionId}
            />
          </div>
          <div className="lg:col-span-5">
            <TacticalMap
              kodamNodes={kodamNodes}
              honeytoken={honeypot}
              onImmunityBroadcast={handleImmunityBroadcast}
              broadcast={broadcast}
              busy={commandBusy}
            />
          </div>
          <div className="lg:col-span-12">
            <LiveTerminalSpy
              history={terminalHistory}
              onCommand={executeCommand}
              session={activeSession}
              busy={commandBusy}
            />
          </div>
          <div className="lg:col-span-7">
            <MitreMatrix techniques={mitreTechniques} profile={mitreProfile} />
          </div>
          <div className="lg:col-span-5">
            <ForensicTable blocks={ledger} onTamper={handleTamper} onRestore={handleRestore} onExportPdf={handleExportPdf} />
          </div>
        </div>

        {integrityBad && (
          <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 border-l-[3px] border-l-danger p-4 text-[13px] text-danger">
            <span className="flex items-center gap-2">
              <Icon name="seal-warning" className="h-4 w-4" />
              Integritas bukti: <strong>TAMPERED_CRITICAL</strong>. Anomali rantai hash SHA-256 terdeteksi.
            </span>
            <button
              onClick={handleRestore}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-accent-deep"
            >
              <Icon name="seal-check" className="h-3.5 w-3.5" /> Pulihkan rantai sah
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
