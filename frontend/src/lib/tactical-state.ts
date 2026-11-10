/**
 * State ruang komando yang diturunkan dari log event WebSocket.
 *
 * Tanpa scope (mode bebas): semua event diterapkan, snapshot mengganti state.
 * Dengan scope (mode guide): hanya event sesi juri + bagian global (peta Kodam, ledger, integritas).
 * State diturunkan ulang dari log setiap kali scope berubah, sehingga event yang tiba
 * sebelum token login diketahui tetap tampil.
 */
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
  TacticalEnvelope,
  TerminalCommandExecuted,
} from "@/lib/types";

export interface TacticalState {
  sessions: SessionState[];
  alert: InterceptionAlert | null;
  ot: OTSabotageAttempt | null;
  terminalHistory: TerminalCommandExecuted[];
  mitreTechniques: MitreEnrichment[];
  mitreProfile: AttackerProfile | null;
  honeytoken: HoneytokenTriggered | null;
  kodamNodes: KodamNode[];
  broadcast: ImmunityBroadcasted | null;
  ledger: ForensicBlock[];
  integrity: ChainIntegrity;
  latestSessionId: string | null;
}

/** undefined = tanpa filter (mode bebas). { sessionId: null } = hanya data global. */
export type TacticalScope = { sessionId: string | null } | undefined;

export const LOG_CAP = 500;

export const initialTacticalState: TacticalState = {
  sessions: [],
  alert: null,
  ot: null,
  terminalHistory: [],
  mitreTechniques: [],
  mitreProfile: null,
  honeytoken: null,
  kodamNodes: [],
  broadcast: null,
  ledger: [],
  integrity: "VALID_IMMUTABLE",
  latestSessionId: null,
};

export function appendLog(
  log: readonly TacticalEnvelope[],
  env: TacticalEnvelope,
): TacticalEnvelope[] {
  // Setiap FORENSIC_INTEGRITY_ALERT membawa seluruh ledger; cukup simpan salinan penuh di event terbaru.
  const hasLedger = (e: TacticalEnvelope) =>
    e.event_type === "FORENSIC_INTEGRITY_ALERT" && (e.payload as ForensicIntegrityAlert).ledger !== undefined;
  const prior = hasLedger(env)
    ? log.map((e) => {
        if (!hasLedger(e)) return e;
        const { ledger: _drop, ...rest } = e.payload as ForensicIntegrityAlert;
        return { ...e, payload: rest };
      })
    : log;
  const next = [...prior, env];
  return next.length > LOG_CAP ? next.slice(next.length - LOG_CAP) : next;
}

export function deriveTactical(
  log: readonly TacticalEnvelope[],
  scope: TacticalScope,
): TacticalState {
  return log.reduce<TacticalState>(
    (s, env) => reduceTactical(s, env, scope),
    initialTacticalState,
  );
}

function chainIntegrityOf(ledger: ForensicBlock[]): ChainIntegrity {
  return ledger.some((b) => b.chain_integrity === "TAMPERED_CRITICAL")
    ? "TAMPERED_CRITICAL"
    : "VALID_IMMUTABLE";
}

function scopeLedger(
  ledger: ForensicBlock[],
  scope: TacticalScope,
): ForensicBlock[] {
  if (!scope) return ledger;
  return ledger.filter(
    (b) =>
      b.block_index === 0 ||
      (scope.sessionId !== null && b.session_id === scope.sessionId),
  );
}

function patchSession(
  s: TacticalState,
  sid: string | null,
  patch: Partial<SessionState>,
): SessionState[] {
  if (!sid) return s.sessions;
  return s.sessions.map((x) => (x.session_id === sid ? { ...x, ...patch } : x));
}

function applySnapshot(
  s: TacticalState,
  snap: StateSnapshot,
  scope: TacticalScope,
): TacticalState {
  const ledger = scopeLedger(snap.forensic_ledger, scope);
  const global = {
    kodamNodes: snap.kodam_nodes,
    ledger,
    integrity: chainIntegrityOf(snap.forensic_ledger),
    broadcast: snap.latest_immunity ?? null,
  };
  if (scope) {
    // Isi lain di snapshot tidak membawa session_id: jangan timpa data sesi juri.
    const sessions = snap.sessions.filter(
      (x) => x.session_id === scope.sessionId,
    );
    return {
      ...s,
      ...global,
      // Vaksin milik juri sendiri bertahan walau browser lain me-reset panggung;
      // latest_immunity di snapshot bisa milik sesi lain, jadi tidak dipakai di scope.
      kodamNodes: s.broadcast ? s.kodamNodes : snap.kodam_nodes,
      broadcast: s.broadcast,
      sessions: sessions.length > 0 ? sessions : s.sessions,
    };
  }
  return {
    ...s,
    ...global,
    sessions: snap.sessions,
    terminalHistory: snap.terminal_history,
    mitreTechniques: snap.mitre_techniques,
    alert: snap.latest_alert ?? null,
    ot: snap.latest_ot ?? null,
    honeytoken: snap.latest_honeytoken ?? null,
    mitreProfile:
      snap.mitre_techniques[0]?.attacker_profile ??
      snap.sessions[0]?.attacker_profile ??
      snap.latest_alert?.attacker_profile ??
      null,
    latestSessionId: snap.sessions[0]?.session_id ?? null,
  };
}

function applyIntegrity(
  s: TacticalState,
  fia: ForensicIntegrityAlert,
  scope: TacticalScope,
): TacticalState {
  if (fia.ledger && fia.ledger.length > 0) {
    return {
      ...s,
      integrity: fia.chain_integrity,
      ledger: scopeLedger(fia.ledger, scope),
    };
  }
  const bad = fia.tampered_block_index ?? fia.block_index;
  const ledger = s.ledger.map((b) =>
    fia.chain_integrity === "VALID_IMMUTABLE"
      ? {
          ...b,
          chain_integrity: fia.chain_integrity,
          tampered_block_index: null,
        }
      : b.block_index === bad
        ? {
            ...b,
            chain_integrity: fia.chain_integrity,
            tampered_block_index: bad,
          }
        : b,
  );
  return { ...s, integrity: fia.chain_integrity, ledger };
}

function applyAlert(
  s: TacticalState,
  al: InterceptionAlert,
  sid: string,
): TacticalState {
  const exists = s.sessions.some((x) => x.session_id === sid);
  const sessions = exists
    ? patchSession(s, sid, {
        threat_score: al.threat_score,
        entry_vector: al.entry_vector,
        routing_mode: al.routing_mode,
      })
    : [
        {
          session_id: sid,
          threat_score: al.threat_score,
          entry_vector: al.entry_vector,
          routing_mode: al.routing_mode,
          status: "ACTIVE",
          started_at: new Date().toISOString(),
          cwd: "/opt/satcom",
          attacker_profile: al.attacker_profile,
        },
        ...s.sessions,
      ];
  const kodamNodes = s.kodamNodes.map((k) =>
    k.kodam_id === "KODAM-III" && k.status !== "IMMUNE_PROTECTED"
      ? { ...k, status: "UNDER_DECEPTION" as const }
      : k,
  );
  return { ...s, alert: al, sessions, kodamNodes, latestSessionId: sid };
}

export function reduceTactical(
  s: TacticalState,
  env: TacticalEnvelope,
  scope: TacticalScope,
): TacticalState {
  const sid = env.session_id;
  const isGlobalEvent = sid === null;
  if (scope && !isGlobalEvent && sid !== scope.sessionId) return s;

  switch (env.event_type) {
    case "INITIAL_STATE_SYNC":
      return applySnapshot(s, env.payload as StateSnapshot, scope);
    case "FORENSIC_INTEGRITY_ALERT":
      return applyIntegrity(s, env.payload as ForensicIntegrityAlert, scope);
    case "IMMUNITY_BROADCASTED": {
      const imm = env.payload as ImmunityBroadcasted;
      const kodamNodes = imm.kodam_nodes_status?.length
        ? imm.kodam_nodes_status
        : s.kodamNodes.map((k) => ({
            ...k,
            status: "IMMUNE_PROTECTED" as const,
          }));
      return { ...s, broadcast: imm, kodamNodes };
    }
    default:
      break;
  }

  // Event berikut milik sesi tertentu; dalam scope, event tanpa sesi tidak dipakai.
  if (scope && isGlobalEvent) return s;

  switch (env.event_type) {
    case "INTERCEPTION_ALERT":
      return applyAlert(
        s,
        env.payload as InterceptionAlert,
        sid ?? "ses-unknown",
      );
    case "OT_SABOTAGE_ATTEMPT":
      return { ...s, ot: env.payload as OTSabotageAttempt };
    case "TERMINAL_COMMAND_EXECUTED": {
      const item = env.payload as TerminalCommandExecuted;
      if (s.terminalHistory.some((x) => x.command_id === item.command_id))
        return s;
      return {
        ...s,
        terminalHistory: [...s.terminalHistory, item],
        sessions: patchSession(s, sid, { cwd: item.cwd }),
      };
    }
    case "MITRE_ENRICHMENT_READY": {
      const t = env.payload as MitreEnrichment;
      const mitreTechniques = [
        t,
        ...s.mitreTechniques.filter((x) => x.technique_id !== t.technique_id),
      ];
      if (!t.attacker_profile) return { ...s, mitreTechniques };
      return {
        ...s,
        mitreTechniques,
        mitreProfile: t.attacker_profile,
        sessions: patchSession(s, sid, {
          attacker_profile: t.attacker_profile,
        }),
      };
    }
    case "HONEYTOKEN_TRIGGERED": {
      const ht = env.payload as HoneytokenTriggered;
      return {
        ...s,
        honeytoken: ht,
        sessions: patchSession(s, sid, {
          real_leaked_ip: ht.real_leaked_ip,
          apparent_ip: ht.apparent_proxy_ip,
        }),
      };
    }
    default:
      return s;
  }
}

/** IP yang dikirim beacon simulasi (lib/api triggerTelemetryBeacon): penanda "data contoh". */
export const SAMPLE_LEAKED_IP = "103.147.12.89";

/** Blok non-genesis pertama milik sesi: target uji manipulasi yang tidak merusak bukti juri lain. */
export function ownTamperTarget(ledger: readonly ForensicBlock[], sessionId: string | null): number | null {
  if (!sessionId) return null;
  return ledger.find((b) => b.block_index > 0 && b.session_id === sessionId)?.block_index ?? null;
}
