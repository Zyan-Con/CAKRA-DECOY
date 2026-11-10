"""
Integration test end-to-end untuk CAKRA-DECOY backend (gate CI).
Mencakup lane Orang 1 (detector/decoy/ai_shell/mitre) + Orang 3 (honeytoken/forensic/pdf).
"""

import os

os.environ["DEMO_EMITTER"] = "0"  # matikan noise demo saat test

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402


def _drain(ws, want, tries=14):
    for _ in range(tries):
        e = ws.receive_json()
        if e["event_type"] == want:
            return e
    raise AssertionError(f"event {want} tidak muncul")


def test_health():
    with TestClient(main.app) as c:
        r = c.get("/health")
        assert r.status_code == 200 and r.json()["status"] == "ok"


def test_clean_login_routes_to_real_portal():
    with TestClient(main.app) as c:
        tok = c.post(
            "/api/auth/login",
            json={"username": "kopda_budi", "password": "RahasiaKuat123"},
        ).json()["session_token"]
        ps = c.get("/api/portal/state", params={"session_token": tok}).json()
        assert ps["unit"] == "Portal Logistik Satuan"


def test_sqli_login_triggers_interception_and_decoy():
    with TestClient(main.app) as c:
        with c.websocket_connect("/ws/command-stream") as ws:
            assert ws.receive_json()["event_type"] == "INITIAL_STATE_SYNC"
            tok = c.post(
                "/api/auth/login",
                json={"username": "admin' OR '1'='1", "password": "x"},
            ).json()["session_token"]
            ev = _drain(ws, "INTERCEPTION_ALERT")
            assert ev["payload"]["routing_mode"] == "DECOY_MIRROR_TWIN"
            assert ev["payload"]["threat_score"] >= 70
            ps = c.get("/api/portal/state", params={"session_token": tok}).json()
            assert "DECOY" in ps["unit"]


def test_terminal_and_async_mitre():
    with TestClient(main.app) as c:
        tok = c.post(
            "/api/auth/login", json={"username": "admin' OR '1'='1", "password": "x"}
        ).json()["session_token"]
        with c.websocket_connect("/ws/command-stream") as ws:
            assert ws.receive_json()["event_type"] == "INITIAL_STATE_SYNC"
            c.post(
                "/api/sys/console",
                json={
                    "session_token": tok,
                    "command": "cat /opt/satcom/kredensial_komando.env",
                },
            )
            term = _drain(ws, "TERMINAL_COMMAND_EXECUTED")
            assert "SATCOM_BEARER_TOKEN" in term["payload"]["simulated_output"]
            mitre = _drain(ws, "MITRE_ENRICHMENT_READY")
            assert mitre["payload"]["technique_id"] == "T1552.001"


def test_ot_sabotage_illusion():
    with TestClient(main.app) as c:
        tok = c.post(
            "/api/auth/login", json={"username": "admin' OR '1'='1", "password": "x"}
        ).json()["session_token"]
        r = c.post(
            "/api/ot/control",
            json={
                "session_token": tok,
                "action": "OVERRIDE_VOLTAGE",
                "target_system": "RADAR_COOLING",
            },
        )
        assert r.json()["radar_cooling_temp_c"] == 115.8  # penyerang lihat ilusi


def test_honeytoken_canary_ticket():
    with TestClient(main.app) as c:
        with c.websocket_connect("/ws/command-stream") as ws:
            assert ws.receive_json()["event_type"] == "INITIAL_STATE_SYNC"
            r = c.get(
                "/api/v1/satcom/keys", params={"ticket": "satcom-root-bypass-8821a"}
            )
            assert r.json()["status"] == "KEY_EXCHANGE_AUTHORIZED"
            assert _drain(ws, "HONEYTOKEN_TRIGGERED")["payload"]["token_filename"]


def test_forensic_tamper_then_restore():
    with TestClient(main.app) as c:
        # pastikan ada minimal 1 block
        c.post(
            "/api/auth/login", json={"username": "admin' OR '1'='1", "password": "x"}
        )
        with c.websocket_connect("/ws/command-stream") as ws:
            assert ws.receive_json()["event_type"] == "INITIAL_STATE_SYNC"
            c.post("/api/forensic/tamper-test", json={"block_index": 1})
            assert (
                _drain(ws, "FORENSIC_INTEGRITY_ALERT")["payload"]["chain_integrity"]
                == "TAMPERED_CRITICAL"
            )
            c.post("/api/forensic/restore", json={})
            assert (
                _drain(ws, "FORENSIC_INTEGRITY_ALERT")["payload"]["chain_integrity"]
                == "VALID_IMMUTABLE"
            )


def test_immunity_broadcast():
    with TestClient(main.app) as c:
        tok = c.post(
            "/api/auth/login", json={"username": "admin' OR '1'='1", "password": "x"}
        ).json()["session_token"]
        r = c.post("/api/immunity/broadcast", json={"session_token": tok})
        assert r.json()["status"] == "VACCINE_DEPLOYED"
        assert r.json()["immune_count"] >= 1


def test_pdf_export():
    with TestClient(main.app) as c:
        tok = c.post(
            "/api/auth/login", json={"username": "admin' OR '1'='1", "password": "x"}
        ).json()["session_token"]
        r = c.get("/api/forensic/export-pdf", params={"session_token": tok})
        assert r.status_code == 200 and r.headers["content-type"] == "application/pdf"
        assert r.content[:4] == b"%PDF"


def _sqli_login(c):
    return c.post(
        "/api/auth/login", json={"username": "admin' OR '1'='1", "password": "x"}
    ).json()["session_token"]


def _snapshot(c):
    with c.websocket_connect("/ws/command-stream") as ws:
        ev = ws.receive_json()
        assert ev["event_type"] == "INITIAL_STATE_SYNC"
        return ev["payload"]


def test_ledger_blocks_carry_session_id():
    with TestClient(main.app) as c:
        tok = _sqli_login(c)
        ledger = _snapshot(c)["forensic_ledger"]
        assert any(b.get("session_id") == tok for b in ledger)


def test_demo_reset_restores_kodam_standby():
    with TestClient(main.app) as c:
        tok = _sqli_login(c)
        c.post("/api/immunity/broadcast", json={"session_token": tok})
        r = c.post("/api/demo/reset")
        assert r.status_code == 200 and r.json()["status"] == "DEMO_RESET"
        snap = _snapshot(c)
        assert all(k["status"] == "STANDBY" for k in snap["kodam_nodes"])
        assert snap["latest_immunity"] is None


def test_demo_reset_repairs_tampered_chain():
    with TestClient(main.app) as c:
        _sqli_login(c)
        c.post("/api/forensic/tamper-test", json={"block_index": 1})
        r = c.post("/api/demo/reset")
        assert r.json()["chain_integrity"] == "VALID_IMMUTABLE"
        ledger = _snapshot(c)["forensic_ledger"]
        assert not any(b["chain_integrity"] == "TAMPERED_CRITICAL" for b in ledger)
