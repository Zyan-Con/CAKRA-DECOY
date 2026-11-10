"""
WebSocket hub untuk /ws/command-stream + demo emitter.

Frontend connect ke sini -> langsung dapat INITIAL_STATE_SYNC -> lalu stream event.
Modul logic lain (detector, decoy, honeytoken, forensic) cukup panggil
`await manager.broadcast(make_event(...))` untuk mendorong event ke semua layar.

Demo emitter (aktif kalau env DEMO_EMITTER=1) memancarkan sekuens serangan PALSU
berulang, biar frontend bisa dibangun sebelum logic backend asli jadi.
"""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

import decoy
from schemas import (
    ActorClass,
    AttackerProfile,
    ChainIntegrity,
    DeviceFingerprint,
    EventType,
    ExecutionSource,
    ForensicBlock,
    ForensicIntegrityAlert,
    GeneratedRule,
    GeoLocation,
    HoneytokenTriggered,
    HoneytokenVector,
    ImmunityBroadcasted,
    InterceptionAlert,
    KodamNode,
    KodamStatus,
    MitreEnrichment,
    OTSabotageAttempt,
    RoutingMode,
    SessionState,
    Severity,
    StateSnapshot,
    TerminalCommandExecuted,
    make_event,
)

router = APIRouter()


class ConnectionManager:
    """Simpan daftar client WS aktif + nomor urut event global."""

    def __init__(self) -> None:
        self._clients: set[WebSocket] = set()
        self._lock = asyncio.Lock()
        self._seq = 0

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._clients.add(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(ws)

    def next_seq(self) -> int:
        self._seq += 1
        return self._seq

    async def broadcast(self, event: dict[str, Any]) -> None:
        async with self._lock:
            targets = list(self._clients)
        dead: list[WebSocket] = []
        for ws in targets:
            try:
                await ws.send_json(event)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._clients.discard(ws)


manager = ConnectionManager()


# 15 Komando Daerah Militer (Kodam) se-Indonesia. Koordinat ibu kota satuan.
def _kodam(kodam_id: str, name: str, lat: float, lng: float) -> KodamNode:
    return KodamNode(
        kodam_id=kodam_id, name=name, lat=lat, lng=lng, status=KodamStatus.STANDBY
    )


DEFAULT_KODAM = [
    _kodam("KODAM-IM", "Kodam Iskandar Muda", 5.5483, 95.3238),  # Banda Aceh
    _kodam("KODAM-I", "Kodam I/Bukit Barisan", 3.5952, 98.6722),  # Medan
    _kodam("KODAM-II", "Kodam II/Sriwijaya", -2.9761, 104.7754),  # Palembang
    _kodam("KODAM-JAYA", "Kodam Jaya/Jayakarta", -6.2250, 106.8700),  # Jakarta
    _kodam("KODAM-III", "Kodam III/Siliwangi", -6.9175, 107.6191),  # Bandung
    _kodam("KODAM-IV", "Kodam IV/Diponegoro", -7.0051, 110.4381),  # Semarang
    _kodam("KODAM-V", "Kodam V/Brawijaya", -7.2575, 112.7521),  # Surabaya
    _kodam("KODAM-IX", "Kodam IX/Udayana", -8.6705, 115.2126),  # Denpasar
    _kodam("KODAM-XII", "Kodam XII/Tanjungpura", -0.0263, 109.3425),  # Pontianak
    _kodam("KODAM-VI", "Kodam VI/Mulawarman", -0.5022, 117.1536),  # Balikpapan
    _kodam("KODAM-XIII", "Kodam XIII/Merdeka", 1.4748, 124.8421),  # Manado
    _kodam("KODAM-XIV", "Kodam XIV/Hasanuddin", -5.1477, 119.4327),  # Makassar
    _kodam("KODAM-XVI", "Kodam XVI/Pattimura", -3.6954, 128.1814),  # Ambon
    _kodam("KODAM-XVIII", "Kodam XVIII/Kasuari", -0.8615, 134.0620),  # Manokwari
    _kodam("KODAM-XVII", "Kodam XVII/Cenderawasih", -2.5337, 140.7181),  # Jayapura
]

_DEMO_SESSION = "ses-kdm03-9941a"


def current_kodam_nodes() -> list[KodamNode]:
    """Kembalikan 15 node Kodam dengan status terkini dari SessionStore."""
    overrides = decoy.store.kodam_status
    return [
        k.model_copy(update={"status": overrides[k.kodam_id]})
        if k.kodam_id in overrides
        else k
        for k in DEFAULT_KODAM
    ]


def build_forensic_blocks() -> list[ForensicBlock]:
    """Bangun daftar ForensicBlock lengkap beserta status integritas rantai aktual."""
    import forensic_chain

    is_valid, bad_idx, _ = forensic_chain.forensic_ledger.verify_chain()
    blocks: list[ForensicBlock] = []
    for b in forensic_chain.forensic_ledger.get_all_blocks():
        idx = b["block_index"]
        is_bad = (not is_valid) and (bad_idx is not None and idx == bad_idx)
        blocks.append(
            ForensicBlock(
                block_index=idx,
                timestamp=b["timestamp"],
                action_summary=b["action_summary"],
                previous_hash=b["previous_hash"],
                current_hash=b["current_hash"],
                chain_integrity=ChainIntegrity.TAMPERED
                if is_bad
                else ChainIntegrity.VALID,
                tampered_block_index=bad_idx if is_bad else None,
                session_id=b.get("session_id"),
            )
        )
    return blocks


def build_snapshot() -> StateSnapshot:
    """Snapshot awal: seluruh state aktif agar frontend 100% tahan refresh F5."""
    import mitre_service

    sessions: list[SessionState] = list(decoy.store.all_active())
    if not sessions and os.getenv("DEMO_EMITTER", "0") == "1":
        sessions.append(
            SessionState(
                session_id=_DEMO_SESSION,
                routing_mode=RoutingMode.DECOY,
                threat_score=96,
                entry_vector="SQL_INJECTION_AUTH_BYPASS",
                cwd="/opt/satcom",
                started_at=datetime.now(timezone.utc)
                .astimezone()
                .isoformat(timespec="milliseconds"),
                apparent_ip="185.220.101.44",
            )
        )
    return StateSnapshot(
        kodam_nodes=current_kodam_nodes(),
        sessions=sessions,
        terminal_history=list(decoy.store.terminal_history),
        mitre_techniques=mitre_service.profiler.recent_enrichments(),
        forensic_ledger=build_forensic_blocks(),
        latest_alert=decoy.store.latest_alert,
        latest_ot=decoy.store.latest_ot,
        latest_honeytoken=decoy.store.latest_honeytoken,
        latest_immunity=decoy.store.latest_immunity,
    )


@router.websocket("/ws/command-stream")
async def command_stream(ws: WebSocket) -> None:
    await manager.connect(ws)
    # Kirim snapshot awal langsung (frontend tahan refresh F5).
    await ws.send_json(
        make_event(
            EventType.INITIAL_STATE_SYNC, build_snapshot(), seq=manager.next_seq()
        )
    )
    try:
        while True:
            # Pesan dari client tidak dipakai; receive cuma jaga koneksi tetap hidup.
            await ws.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(ws)
    except Exception:
        await manager.disconnect(ws)


# ---------------- Demo emitter (scaffold dev, BUKAN logic asli) ----------------


def _demo_events() -> list[dict[str, Any]]:
    s = manager.next_seq
    profile = AttackerProfile(
        actor_classification=ActorClass.APT,
        confidence_pct=92,
        primary_intent="OT_RADAR_SABOTAGE",
        psychological_summary="Penyerang memahami topologi SCADA militer (data demo).",
    )
    return [
        make_event(
            EventType.INTERCEPTION_ALERT,
            InterceptionAlert(
                threat_score=96,
                entry_vector="SQL_INJECTION_AUTH_BYPASS",
                routing_mode=RoutingMode.DECOY,
                interception_latency_ms=2.4,
                attacker_profile=profile,
            ),
            session_id=_DEMO_SESSION,
            seq=s(),
        ),
        make_event(
            EventType.TERMINAL_COMMAND_EXECUTED,
            TerminalCommandExecuted(
                command_id="cmd-001",
                cwd="/opt/satcom",
                prompt="ubuntu@srv-kodam-logistik-01:/opt/satcom$",
                raw_input="ls -la",
                simulated_output="Akses_Darurat_Satelit_TNI.html\nkredensial_komando.env",
                execution_source=ExecutionSource.VFS,
                response_time_ms=1.4,
            ),
            session_id=_DEMO_SESSION,
            seq=s(),
        ),
        make_event(
            EventType.OT_SABOTAGE_ATTEMPT,
            OTSabotageAttempt(
                target_system="RADAR_COOLING",
                action="OVERRIDE_VOLTAGE",
            ),
            session_id=_DEMO_SESSION,
            seq=s(),
        ),
        make_event(
            EventType.MITRE_ENRICHMENT_READY,
            MitreEnrichment(
                tactic_id="TA0006",
                tactic_name="Credential Access",
                technique_id="T1552.001",
                technique_name="Unsecured Credentials: Credentials In Files",
                severity=Severity.CRITICAL,
                cumulative_techniques=["T1190", "T0855", "T1059.004", "T1552.001"],
                attacker_profile=profile,
            ),
            session_id=_DEMO_SESSION,
            seq=s(),
        ),
        make_event(
            EventType.HONEYTOKEN_TRIGGERED,
            HoneytokenTriggered(
                vector_type=HoneytokenVector.CLI_CANARY,
                token_id="ht-env-01",
                token_filename="kredensial_komando.env",
                apparent_proxy_ip="185.220.101.44",
                real_leaked_ip="103.147.12.89",
                local_lan_ip="192.168.1.45",
                geo_location=GeoLocation(
                    lat=-6.21,
                    lng=106.84,
                    city="Jakarta",
                    country="ID",
                    accuracy_radius_m=25000,
                ),
                device_fingerprint=DeviceFingerprint(
                    os="Linux x86_64",
                    browser="Chrome/131.0.0.0",
                    gpu_renderer="ANGLE (NVIDIA RTX 4070)",
                    screen_resolution="1920x1080",
                    webrtc_stun_leak=True,
                    canvas_hash="e4b89100a2c7f91d",
                ),
            ),
            session_id=_DEMO_SESSION,
            seq=s(),
        ),
        make_event(
            EventType.FORENSIC_INTEGRITY_ALERT,
            ForensicIntegrityAlert(
                block_index=4,
                chain_integrity=ChainIntegrity.VALID,
                action_summary="HONEYTOKEN_CALLBACK tercatat ke ledger (data demo).",
            ),
            session_id=_DEMO_SESSION,
            seq=s(),
        ),
        make_event(
            EventType.IMMUNITY_BROADCASTED,
            ImmunityBroadcasted(
                broadcast_active=True,
                generated_rule=GeneratedRule(
                    rule_id="CAKRA-VAC-2026-004",
                    iptables_cmd="iptables -A INPUT -s 103.147.12.89/32 -j DROP",
                    modsec_rule='SecRule ARGS "@detectSQLi" "id:990014,phase:2,deny,status:403"',
                ),
                kodam_nodes_status=[
                    k.model_copy(update={"status": KodamStatus.IMMUNE})
                    for k in DEFAULT_KODAM
                ],
            ),
            session_id=_DEMO_SESSION,
            seq=s(),
        ),
    ]


async def _demo_loop(interval: float = 2.0) -> None:
    await asyncio.sleep(1.0)
    while True:
        for event in _demo_events():
            await manager.broadcast(event)
            await asyncio.sleep(interval)


def start_demo_emitter() -> asyncio.Task[None]:
    """Jalankan loop demo di background. Dipanggil dari main.py saat DEMO_EMITTER=1."""
    return asyncio.create_task(_demo_loop())
