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
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import ai_shell
import decoy
import detector
import mitre_service
import ws
from schemas import (
    EventType,
    InterceptionAlert,
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
async def sys_console(req: ConsoleReq) -> dict:
    s = decoy.store.get(req.session_token)
    cwd = s.cwd if s is not None else ai_shell.DEFAULT_CWD
    result = ai_shell.run(req.command, cwd)
    if s is not None:
        decoy.store.update_cwd(req.session_token, result.cwd)
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
    }
