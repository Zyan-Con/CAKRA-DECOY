/**
 * CAKRA-DECOY 2.0 — Frontend Type Contract (mirror dari backend/schemas.py).
 * Sumber kebenaran: backend/schemas.py + docs/API_CONTRACT.md (schema_version 2.0).
 * Kalau backend naik schema_version, naikkan juga di sini + di docs.
 */

export const SCHEMA_VERSION = "2.0";

export const EVENT_TYPES = [
  "INITIAL_STATE_SYNC",
  "INTERCEPTION_ALERT",
  "OT_SABOTAGE_ATTEMPT",
  "TERMINAL_COMMAND_EXECUTED",
  "MITRE_ENRICHMENT_READY",
  "HONEYTOKEN_TRIGGERED",
  "IMMUNITY_BROADCASTED",
  "FORENSIC_INTEGRITY_ALERT",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type RoutingMode = "REAL_SYSTEM" | "DECOY_MIRROR_TWIN";
export type ActorClass =
  | "SCRIPT_KIDDIE"
  | "ORGANIZED_CYBERCRIME"
  | "STATE_SPONSORED_APT";
export type ExecutionSource =
  | "VFS_DETERMINISTIC_ENGINE"
  | "LLM_CONTEXT_SHELL"
  | "STATIC_FALLBACK";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ChainIntegrity = "VALID_IMMUTABLE" | "TAMPERED_CRITICAL";
export type KodamStatus =
  | "STANDBY"
  | "UNDER_DECEPTION"
  | "IMMUNE_PROTECTED";
export type HoneytokenVector =
  | "HTML_WEBRTC_BEACON"
  | "CLI_CANARY_API_TRIGGER"
  | "SOURCE_COMMENT_BAIT";

export interface AttackerProfile {
  actor_classification: ActorClass;
  confidence_pct: number;
  primary_intent: string;
  psychological_summary: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
  accuracy_radius_m: number;
}

export interface DeviceFingerprint {
  os: string;
  browser: string;
  gpu_renderer: string;
  screen_resolution: string;
  webrtc_stun_leak: boolean;
  canvas_hash: string;
}

export interface KodamNode {
  kodam_id: string;
  name: string;
  lat: number;
  lng: number;
  status: KodamStatus;
}

export interface ForensicBlock {
  block_index: number;
  timestamp: string;
  action_summary: string;
  previous_hash: string;
  current_hash: string;
  chain_integrity: ChainIntegrity;
  tampered_block_index?: number | null;
}

export interface GeneratedRule {
  rule_id: string;
  iptables_cmd: string;
  modsec_rule: string;
}

export interface InterceptionAlert {
  threat_score: number;
  entry_vector: string;
  routing_mode: RoutingMode;
  interception_latency_ms: number;
  attacker_profile?: AttackerProfile | null;
}

export interface OTSabotageAttempt {
  target_system: string;
  action: string;
  real_radar_temp_c: number;
  decoy_radar_temp_c: number;
  real_cooling_status: string;
  decoy_cooling_status: string;
}

export interface TerminalCommandExecuted {
  command_id: string;
  cwd: string;
  prompt: string;
  raw_input: string;
  simulated_output: string;
  execution_source: ExecutionSource;
  response_time_ms: number;
}

export interface MitreEnrichment {
  tactic_id: string;
  tactic_name: string;
  technique_id: string;
  technique_name: string;
  severity: Severity;
  cumulative_techniques: string[];
  attacker_profile?: AttackerProfile | null;
}

export interface HoneytokenTriggered {
  vector_type: HoneytokenVector;
  token_id: string;
  token_filename: string;
  apparent_proxy_ip: string;
  real_leaked_ip: string;
  local_lan_ip?: string | null;
  geo_location: GeoLocation;
  device_fingerprint?: DeviceFingerprint | null;
}

export interface ImmunityBroadcasted {
  broadcast_active: boolean;
  generated_rule: GeneratedRule;
  kodam_nodes_status: KodamNode[];
}

export interface ForensicIntegrityAlert {
  block_index: number;
  chain_integrity: ChainIntegrity;
  tampered_block_index?: number | null;
  action_summary: string;
}

export interface SessionState {
  session_id: string;
  routing_mode: RoutingMode;
  threat_score: number;
  entry_vector: string;
  cwd: string;
  status: string;
  started_at: string;
  apparent_ip?: string | null;
  real_leaked_ip?: string | null;
  attacker_profile?: AttackerProfile | null;
}

export interface StateSnapshot {
  sessions: SessionState[];
  terminal_history: TerminalCommandExecuted[];
  mitre_techniques: MitreEnrichment[];
  kodam_nodes: KodamNode[];
  forensic_ledger: ForensicBlock[];
}

/** Envelope WebSocket flat (sama dengan backend/schemas.py Envelope). */
export interface TacticalEnvelope {
  schema_version: string;
  event_id: string;
  event_type: EventType;
  timestamp: string;
  session_id: string | null;
  seq: number;
  payload: unknown;
}

export type TacticalEvent =
  | { type: "INITIAL_STATE_SYNC"; payload: StateSnapshot }
  | { type: "INTERCEPTION_ALERT"; payload: InterceptionAlert }
  | { type: "OT_SABOTAGE_ATTEMPT"; payload: OTSabotageAttempt }
  | { type: "TERMINAL_COMMAND_EXECUTED"; payload: TerminalCommandExecuted }
  | { type: "MITRE_ENRICHMENT_READY"; payload: MitreEnrichment }
  | { type: "HONEYTOKEN_TRIGGERED"; payload: HoneytokenTriggered }
  | { type: "IMMUNITY_BROADCASTED"; payload: ImmunityBroadcasted }
  | { type: "FORENSIC_INTEGRITY_ALERT"; payload: ForensicIntegrityAlert };
