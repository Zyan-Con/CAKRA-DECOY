"""
CAKRA-DECOY 2.0 — FastAPI entrypoint (scaffold).

Jalankan (dari folder backend/):
    uvicorn main:app --reload --port 8000

Set DEMO_EMITTER=1 di .env untuk memancarkan event palsu ke frontend
tanpa perlu logic backend asli selesai.

Modul logic (detector, decoy, ai_shell, mitre_service, honeytoken,
forensic_chain, pdf_service) nanti didaftarkan router-nya di sini.
"""

from __future__ import annotations

import asyncio
import os
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import ai_shell
import decoy
import detector
import forensic_chain
import honeytoken
import mitre_service
import pdf_service
import ws
from schemas import (
    ChainIntegrity,
    DeviceFingerprint,
    EventType,
    ForensicIntegrityAlert,
    GeneratedRule,
    GeoLocation,
    HoneytokenTriggered,
    HoneytokenVector,
    ImmunityBroadcasted,
    InterceptionAlert,
    KodamNode,
    KodamStatus,
    OTSabotageAttempt,
    RoutingMode,
    TerminalCommandExecuted,
    make_event,
)

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = None
    if os.getenv("DEMO_EMITTER", "0") == "1":
        task = ws.start_demo_emitter()
    yield
    if task is not None:
        task.cancel()


app = FastAPI(title="CAKRA-DECOY 2.0 Backend", version="2.0", lifespan=lifespan)

# Demo: izinkan semua origin. Produksi: batasi ke host frontend saja.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "cakra-decoy-backend"}


# ---------------- Request bodies ----------------


class LoginReq(BaseModel):
    username: str
    password: str


class OTControlReq(BaseModel):
    session_token: str
    action: str
    target_system: str


class ConsoleReq(BaseModel):
    session_token: str
    command: str


# ---------------- Endpoint inti ----------------


async def _emit_mitre(session_id: str, **signal) -> None:
    """Analisis MITRE + broadcast. Dipanggil via create_task biar non-blocking."""
    enrich = mitre_service.profiler.analyze(session_id, **signal)
    await ws.manager.broadcast(
        make_event(
            EventType.MITRE_ENRICHMENT_READY,
            enrich,
            session_id=session_id,
            seq=ws.manager.next_seq(),
        )
    )


# Respon login SELALU identik (opaque): penyerang tidak tahu dia dibelokkan.
_OPAQUE_LOGIN_RESPONSE = {
    "status": "AUTHENTICATED",
    "operator_role": "LOGISTICS_COMMAND_ADMIN",
    "clearance_level": "LEVEL_4_RESTRICTED",
}


@app.post("/api/auth/login")
async def login(req: LoginReq, request: Request) -> dict:
    t0 = time.perf_counter()
    result = detector.score_payload(req.username, req.password)
    latency_ms = round((time.perf_counter() - t0) * 1000, 3)

    token = f"ses-{uuid4().hex[:10]}"
    if result.is_attack:
        client_ip = request.client.host if request.client else None
        decoy.store.create(
            token,
            RoutingMode.DECOY,
            result.score,
            result.entry_vector,
            apparent_ip=client_ip,
        )
        forensic_chain.forensic_ledger.add_block(
            token,
            f"INITIAL_INFILTRATION: Threat Score {result.score} via {result.entry_vector}",
            details={"threat_score": result.score, "entry_vector": result.entry_vector},
        )
        await ws.manager.broadcast(
            make_event(
                EventType.INTERCEPTION_ALERT,
                InterceptionAlert(
                    threat_score=result.score,
                    entry_vector=result.entry_vector,
                    routing_mode=RoutingMode.DECOY,
                    interception_latency_ms=latency_ms,
                ),
                session_id=token,
                seq=ws.manager.next_seq(),
            )
        )
        asyncio.create_task(_emit_mitre(token, vector=result.entry_vector))
    # Prajurit sah maupun penyerang menerima respon + token yang sama bentuknya.
    return {**_OPAQUE_LOGIN_RESPONSE, "session_token": token}


@app.get("/api/portal/state")
async def portal_state(session_token: str) -> dict:
    s = decoy.store.get(session_token)
    if s is not None and s.routing_mode == RoutingMode.DECOY:
        return decoy.decoy_portal_state()
    return decoy.real_portal_state()


@app.post("/api/ot/control")
async def ot_control(req: OTControlReq) -> dict:
    illusion = decoy.ot_sabotage_illusion(req.target_system, req.action)
    forensic_chain.forensic_ledger.add_block(
        req.session_token,
        f"OT_SCADA_SABOTAGE: Action '{req.action}' targeted '{req.target_system}' (Overheat illusion: 115.8°C)",
        details=illusion,
    )
    await ws.manager.broadcast(
        make_event(
            EventType.OT_SABOTAGE_ATTEMPT,
            OTSabotageAttempt(**illusion),
            session_id=req.session_token,
            seq=ws.manager.next_seq(),
        )
    )
    asyncio.create_task(_emit_mitre(req.session_token, ot_action=req.action))
    # Penyerang cuma lihat ilusi overheat; sistem asli tetap aman.
    return {
        "status": "COMMAND_EXECUTED",
        "radar_cooling_temp_c": illusion["decoy_radar_temp_c"],
        "cooling_status": illusion["decoy_cooling_status"],
    }


@app.post("/api/sys/console")
async def sys_console(req: ConsoleReq, request: Request) -> dict:
    s = decoy.store.get(req.session_token)
    cwd = s.cwd if s is not None else ai_shell.DEFAULT_CWD
    # Suntik konten honeytoken dinamis: token yang dibaca via `cat` identik dengan
    # file yang diunduh (JWT valid + host aktual), sehingga Operasi Bumerang tetap
    # terpicu walau penyerang menyalin token dari terminal, bukan dari file unduhan.
    base_url = str(request.base_url).rstrip("/")
    overrides = {
        "/opt/satcom/kredensial_komando.env": honeytoken.generate_env_honeytoken(
            req.session_token, base_url
        ),
        "/opt/satcom/Akses_Darurat_Satelit_TNI.html": honeytoken.generate_html_honeytoken(
            req.session_token, base_url
        ),
    }
    result = ai_shell.run(req.command, cwd, overrides=overrides)
    if s is not None:
        decoy.store.update_cwd(req.session_token, result.cwd)

    forensic_chain.forensic_ledger.add_block(
        req.session_token,
        f"TERMINAL_COMMAND: '{req.command}' executed in {result.cwd} ({result.execution_source})",
        details={
            "command": req.command,
            "cwd": result.cwd,
            "output": result.output[:100],
        },
    )

    await ws.manager.broadcast(
        make_event(
            EventType.TERMINAL_COMMAND_EXECUTED,
            TerminalCommandExecuted(
                command_id=f"cmd-{uuid4().hex[:6]}",
                cwd=result.cwd,
                prompt=ai_shell.prompt_for(result.cwd),
                raw_input=req.command,
                simulated_output=result.output,
                execution_source=result.execution_source,
                response_time_ms=result.response_time_ms,
            ),
            session_id=req.session_token,
            seq=ws.manager.next_seq(),
        )
    )
    asyncio.create_task(_emit_mitre(req.session_token, command=req.command))
    return {
        "output": result.output,
        "cwd": result.cwd,
        "prompt": ai_shell.prompt_for(result.cwd),
        "execution_source": result.execution_source,
        "response_time_ms": result.response_time_ms,
    }


# ---------------- Role 3: Counter-Intel, Forensics & Demo Endpoints ----------------


class TamperReq(BaseModel):
    block_index: int = 1


class ImmunityReq(BaseModel):
    session_token: str | None = None


@app.get("/api/vfs/download/{filename}")
async def vfs_download(
    filename: str, request: Request, session_token: str = "ses-kdm03-9941a"
) -> Response:
    base_url = str(request.base_url).rstrip("/")
    if "Akses_Darurat_Satelit" in filename:
        html = honeytoken.generate_html_honeytoken(session_token, base_url)
        return Response(content=html, media_type="text/html; charset=utf-8")
    elif "kredensial_komando" in filename:
        env = honeytoken.generate_env_honeytoken(session_token, base_url)
        return Response(content=env, media_type="text/plain; charset=utf-8")
    raise HTTPException(status_code=404, detail="File virtual tidak ditemukan.")


@app.api_route("/api/telemetry/sync", methods=["GET", "POST"])
async def telemetry_sync(request: Request) -> dict:
    client_ip = request.client.host if request.client else "127.0.0.1"
    raw_body = b""
    if request.method == "POST":
        raw_body = await request.body()
    else:
        b64_param = request.query_params.get("b", "")
        if b64_param:
            import base64

            try:
                raw_body = base64.b64decode(b64_param)
            except Exception:
                raw_body = b""

    tel = honeytoken.process_beacon_payload(raw_body, client_ip)
    sid = tel.get("session_id", "ses-kdm03-9941a")
    leaked_ip = tel.get("real_leaked_ip", client_ip)

    # Catat di ledger SHA-256
    forensic_chain.forensic_ledger.add_block(
        sid,
        f"HONEYTOKEN_TRIGGER: WebRTC Leak unmasked {leaked_ip} from {tel.get('token_filename')}",
        details=tel,
    )

    # Update decoy session + simpan telemetri untuk laporan DFIR
    s = decoy.store.get(sid)
    if s is not None:
        s.real_leaked_ip = leaked_ip
    decoy.store.set_telemetry(sid, tel)

    # Siarkan ke WebSocket
    await ws.manager.broadcast(
        make_event(
            EventType.HONEYTOKEN_TRIGGERED,
            HoneytokenTriggered(
                vector_type=HoneytokenVector.HTML_BEACON,
                token_id=tel["token_id"],
                token_filename=tel["token_filename"],
                apparent_proxy_ip=tel["apparent_proxy_ip"],
                real_leaked_ip=tel["real_leaked_ip"],
                local_lan_ip=tel["local_lan_ip"],
                geo_location=GeoLocation(**tel["geo_location"]),
                device_fingerprint=DeviceFingerprint(**tel["device_fingerprint"]),
            ),
            session_id=sid,
            seq=ws.manager.next_seq(),
        )
    )
    return {"status": "SYNC_ACKNOWLEDGED", "leaked_ip": leaked_ip}


@app.get("/api/v1/satcom/keys")
async def satcom_keys(request: Request) -> dict:
    client_ip = request.client.host if request.client else "127.0.0.1"
    auth_hdr = request.headers.get("Authorization")
    ticket = request.query_params.get("ticket")
    sid = request.query_params.get("sid")

    triggered, tel = honeytoken.verify_canary_token(
        authorization_header=auth_hdr,
        ticket_query=ticket,
        sid_query=sid,
        client_ip=client_ip,
    )

    if triggered:
        session_id = tel.get("session_id", "ses-kdm03-9941a")
        v_type = (
            HoneytokenVector.CLI_CANARY
            if "JWT" in tel.get("vector_type", "")
            else HoneytokenVector.SOURCE_BAIT
        )

        forensic_chain.forensic_ledger.add_block(
            session_id,
            f"HONEYTOKEN_TRIGGER: Canary token accessed by {client_ip} ({tel.get('token_filename')})",
            details=tel,
        )

        s = decoy.store.get(session_id)
        if s is not None:
            s.real_leaked_ip = client_ip
        decoy.store.set_telemetry(session_id, tel)

        await ws.manager.broadcast(
            make_event(
                EventType.HONEYTOKEN_TRIGGERED,
                HoneytokenTriggered(
                    vector_type=v_type,
                    token_id=tel["token_id"],
                    token_filename=tel["token_filename"],
                    apparent_proxy_ip=tel["apparent_proxy_ip"],
                    real_leaked_ip=tel["real_leaked_ip"],
                    local_lan_ip=tel["local_lan_ip"],
                    geo_location=GeoLocation(**tel["geo_location"]),
                    device_fingerprint=DeviceFingerprint(**tel["device_fingerprint"]),
                ),
                session_id=session_id,
                seq=ws.manager.next_seq(),
            )
        )
        return {"status": "KEY_EXCHANGE_AUTHORIZED", "token_state": "ACTIVE_REGISTERED"}

    return {"status": "UNAUTHORIZED_SATELLITE_UPLINK", "code": 401}


@app.post("/api/forensic/tamper-test")
async def tamper_test(req: TamperReq) -> dict:
    is_valid, res = forensic_chain.forensic_ledger.simulate_tamper(req.block_index)
    await ws.manager.broadcast(
        make_event(
            EventType.FORENSIC_INTEGRITY_ALERT,
            ForensicIntegrityAlert(
                block_index=req.block_index,
                chain_integrity=ChainIntegrity.TAMPERED,
                tampered_block_index=res["tampered_block_index"],
                action_summary="SIMULATED_TAMPER: Unauthorized modification on database log record",
            ),
            seq=ws.manager.next_seq(),
        )
    )
    return res


@app.post("/api/forensic/restore")
async def restore_ledger() -> dict:
    is_valid, res = forensic_chain.forensic_ledger.restore_verified_chain()
    await ws.manager.broadcast(
        make_event(
            EventType.FORENSIC_INTEGRITY_ALERT,
            ForensicIntegrityAlert(
                block_index=0,
                chain_integrity=ChainIntegrity.VALID,
                tampered_block_index=None,
                action_summary="LEDGER_RESTORED: Snapshot cryptographic chain verified and restored",
            ),
            seq=ws.manager.next_seq(),
        )
    )
    return res


@app.get("/api/forensic/export-pdf")
async def export_pdf(session_token: str | None = None) -> Response:
    s = decoy.store.get(session_token) if session_token else None
    sess_dict = s.model_dump() if s else None
    telemetry = decoy.store.get_telemetry(session_token) if session_token else None
    blocks = forensic_chain.forensic_ledger.get_all_blocks()
    _, bad_idx, chain_status = forensic_chain.forensic_ledger.verify_chain()
    pdf_bytes = pdf_service.generate_military_dfir_pdf(
        session_data=sess_dict,
        telemetry_data=telemetry,
        ledger_blocks=blocks,
        chain_status=chain_status,
        tampered_block_index=bad_idx,
    )
    filename = f"Laporan_DFIR_PUSSIBERAD_{session_token or 'INCIDENT'}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/api/immunity/broadcast")
async def immunity_broadcast(req: ImmunityReq) -> dict:
    sid = req.session_token or "ses-kdm03-9941a"
    s = decoy.store.get(sid)
    # Pakai IP asli yang bocor dari honeytoken bila ada; fallback hanya untuk demo.
    leaked_ip = s.real_leaked_ip if s and s.real_leaked_ip else "103.147.12.89"

    rule = GeneratedRule(
        rule_id="CAKRA-VAC-2026-004",
        iptables_cmd=f"iptables -A INPUT -s {leaked_ip}/32 -m string --algo bm --string \"OR '1'='1\" -j DROP",
        modsec_rule='SecRule ARGS "@detectSQLi" "id:990014,phase:2,deny,status:403,msg:\'CAKRA Immuno-Patch\'"',
    )

    immune_nodes = [
        KodamNode(
            kodam_id=n.kodam_id,
            name=n.name,
            lat=n.lat,
            lng=n.lng,
            status=KodamStatus.IMMUNE,
        )
        for n in ws.DEFAULT_KODAM
    ]

    forensic_chain.forensic_ledger.add_block(
        sid,
        f"HERD_IMMUNITY_BROADCAST: 15 Kodam nodes vaccinated against {leaked_ip}",
        details=rule.model_dump(),
    )

    await ws.manager.broadcast(
        make_event(
            EventType.IMMUNITY_BROADCASTED,
            ImmunityBroadcasted(
                broadcast_active=True,
                generated_rule=rule,
                kodam_nodes_status=immune_nodes,
            ),
            session_id=sid,
            seq=ws.manager.next_seq(),
        )
    )
    return {
        "status": "VACCINE_DEPLOYED",
        "rule": rule.model_dump(),
        "immune_count": len(immune_nodes),
    }
