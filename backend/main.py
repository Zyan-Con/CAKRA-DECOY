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

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import ws

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
