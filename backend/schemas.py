"""
CAKRA-DECOY 2.0 — Kontrak data WebSocket & REST (single source of truth).

Semua pesan yang dikirim backend ke frontend WAJIB lewat model di sini.
Kalau ada field yang berubah: naikkan SCHEMA_VERSION dan update docs/API_CONTRACT.md,
biar frontend ikut berubah dan tidak terjadi mismatch.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

SCHEMA_VERSION = "2.0"


def _now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="milliseconds")


def _event_id() -> str:
    return f"evt-{uuid.uuid4()}"


# ---------- Enum nilai status (dipakai frontend untuk warna & label) ----------


class EventType(str, Enum):
    INITIAL_STATE_SYNC = "INITIAL_STATE_SYNC"
    INTERCEPTION_ALERT = "INTERCEPTION_ALERT"
    OT_SABOTAGE_ATTEMPT = "OT_SABOTAGE_ATTEMPT"
    TERMINAL_COMMAND_EXECUTED = "TERMINAL_COMMAND_EXECUTED"
    MITRE_ENRICHMENT_READY = "MITRE_ENRICHMENT_READY"
    HONEYTOKEN_TRIGGERED = "HONEYTOKEN_TRIGGERED"
    IMMUNITY_BROADCASTED = "IMMUNITY_BROADCASTED"
    FORENSIC_INTEGRITY_ALERT = "FORENSIC_INTEGRITY_ALERT"


class RoutingMode(str, Enum):
    REAL = "REAL_SYSTEM"
    DECOY = "DECOY_MIRROR_TWIN"


class ActorClass(str, Enum):
    SCRIPT_KIDDIE = "SCRIPT_KIDDIE"
    ORGANIZED = "ORGANIZED_CYBERCRIME"
    APT = "STATE_SPONSORED_APT"


class ExecutionSource(str, Enum):
    VFS = "VFS_DETERMINISTIC_ENGINE"
    LLM = "LLM_CONTEXT_SHELL"
    FALLBACK = "STATIC_FALLBACK"


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ChainIntegrity(str, Enum):
    VALID = "VALID_IMMUTABLE"
    TAMPERED = "TAMPERED_CRITICAL"


class KodamStatus(str, Enum):
    STANDBY = "STANDBY"
    UNDER_DECEPTION = "UNDER_DECEPTION"
    IMMUNE = "IMMUNE_PROTECTED"


class HoneytokenVector(str, Enum):
    HTML_BEACON = "HTML_WEBRTC_BEACON"
    CLI_CANARY = "CLI_CANARY_API_TRIGGER"
    SOURCE_BAIT = "SOURCE_COMMENT_BAIT"


# ---------- Sub-objek ----------


class GeoLocation(BaseModel):
    lat: float
    lng: float
    city: str
    country: str
    # Lokasi dari IP: akurasi tingkat kota, radius puluhan km. BUKAN GPS presisi.
    accuracy_radius_m: int


class DeviceFingerprint(BaseModel):
    os: str
    browser: str
    gpu_renderer: str
    screen_resolution: str
    webrtc_stun_leak: bool
    canvas_hash: str


class AttackerProfile(BaseModel):
    actor_classification: ActorClass
    confidence_pct: int
    primary_intent: str
    psychological_summary: str


class KodamNode(BaseModel):
    kodam_id: str
    name: str
    lat: float
    lng: float
    status: KodamStatus


class ForensicBlock(BaseModel):
    block_index: int
    timestamp: str
    action_summary: str
    previous_hash: str
    current_hash: str
    chain_integrity: ChainIntegrity = ChainIntegrity.VALID
    tampered_block_index: Optional[int] = None


class GeneratedRule(BaseModel):
    rule_id: str
    iptables_cmd: str
    modsec_rule: str


# ---------- Payload per event_type ----------


class InterceptionAlert(BaseModel):
    threat_score: int
    entry_vector: str
    routing_mode: RoutingMode
    interception_latency_ms: float
    attacker_profile: Optional[AttackerProfile] = None


class OTSabotageAttempt(BaseModel):
    target_system: str
    action: str
    real_radar_temp_c: float = 34.0
    decoy_radar_temp_c: float = 115.8
    real_cooling_status: str = "NOMINAL"
    decoy_cooling_status: str = "CRITICAL_OVERHEAT_ILLUSION"


class TerminalCommandExecuted(BaseModel):
    command_id: str
    cwd: str
    prompt: str
    raw_input: str
    simulated_output: str
    execution_source: ExecutionSource
    response_time_ms: float


class MitreEnrichment(BaseModel):
    tactic_id: str
    tactic_name: str
    technique_id: str
    technique_name: str
    severity: Severity
    cumulative_techniques: list[str]
    attacker_profile: Optional[AttackerProfile] = None


class HoneytokenTriggered(BaseModel):
    vector_type: HoneytokenVector
    token_id: str
    token_filename: str
    apparent_proxy_ip: str
    real_leaked_ip: str
    local_lan_ip: Optional[str] = None
    geo_location: GeoLocation
    device_fingerprint: Optional[DeviceFingerprint] = None


class ImmunityBroadcasted(BaseModel):
    broadcast_active: bool
    generated_rule: GeneratedRule
    kodam_nodes_status: list[KodamNode]


class ForensicIntegrityAlert(BaseModel):
    block_index: int
    chain_integrity: ChainIntegrity
    tampered_block_index: Optional[int] = None
    action_summary: str
    ledger: Optional[list[ForensicBlock]] = None


class SessionState(BaseModel):
    """Satu sesi penyerang yang dibelokkan ke decoy (node di AttackGraph / daftar sesi)."""

    session_id: str
    routing_mode: RoutingMode
    threat_score: int
    entry_vector: str
    cwd: str = "/opt/satcom"
    status: str = "ACTIVE"  # ACTIVE | DISCONNECTED
    started_at: str
    apparent_ip: Optional[str] = None
    real_leaked_ip: Optional[str] = None  # terisi setelah honeytoken kena
    attacker_profile: Optional[AttackerProfile] = None


class StateSnapshot(BaseModel):
    """Isi payload INITIAL_STATE_SYNC — snapshot penuh biar frontend tahan refresh F5."""

    sessions: list[SessionState] = Field(default_factory=list)
    terminal_history: list[TerminalCommandExecuted] = Field(default_factory=list)
    mitre_techniques: list[MitreEnrichment] = Field(default_factory=list)
    kodam_nodes: list[KodamNode] = Field(default_factory=list)
    forensic_ledger: list[ForensicBlock] = Field(default_factory=list)
    latest_alert: Optional[InterceptionAlert] = None
    latest_ot: Optional[OTSabotageAttempt] = None
    latest_honeytoken: Optional[HoneytokenTriggered] = None
    latest_immunity: Optional[ImmunityBroadcasted] = None


# ---------- Envelope pembungkus ----------


class Envelope(BaseModel):
    schema_version: str = SCHEMA_VERSION
    event_id: str = Field(default_factory=_event_id)
    event_type: EventType
    timestamp: str = Field(default_factory=_now_iso)
    session_id: Optional[str] = None
    seq: int = 0
    payload: dict[str, Any]


def make_event(
    event_type: EventType,
    payload: BaseModel | dict[str, Any],
    session_id: str | None = None,
    seq: int = 0,
) -> dict[str, Any]:
    """Bungkus payload jadi envelope siap-kirim (dict JSON)."""
    body = (
        payload.model_dump(mode="json") if isinstance(payload, BaseModel) else payload
    )
    return Envelope(
        event_type=event_type, session_id=session_id, seq=seq, payload=body
    ).model_dump(mode="json")
