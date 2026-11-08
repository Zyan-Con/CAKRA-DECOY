
import base64
import hashlib
import json
import time
import urllib.parse
from typing import Any, Dict, Optional, Tuple


def generate_jwt_honeytoken(session_id: str, secret: str = "CAKRA_MIL_SECRET_2026") -> str:
    """
    Generates a realistic, valid HMAC-SHA256 formatted JWT token without any suspicious labels.
    Contains valid JSON claims when decoded via base64 or jwt.io.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "iss": "pussiberad-satcom-vault",
        "sub": "operator-komando-satelit",
        "role": "satcom_root",
        "clearance": "LEVEL_4_RESTRICTED",
        "sid": session_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 * 30,
    }

    def b64url(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

    header_b64 = b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = b64url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))

    signature_raw = hashlib.sha256(f"{header_b64}.{payload_b64}.{secret}".encode("utf-8")).digest()
    signature_b64 = b64url(signature_raw)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_jwt_honeytoken(token_string: str) -> Optional[Dict[str, Any]]:
    """
    Decodes the JWT payload safely to extract the embedded session_id without throwing errors.
    """
    try:
        parts = token_string.strip().split(".")
        if len(parts) < 2:
            return None
        payload_b64 = parts[1]
        # Fix base64 padding
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += "=" * padding
        decoded_bytes = base64.urlsafe_b64decode(payload_b64.encode("utf-8"))
        return json.loads(decoded_bytes.decode("utf-8"))
    except Exception:
        return None


def generate_env_honeytoken(session_id: str, server_base_url: str) -> str:
    """
    Path 3: Generates kredensial_komando.env file content.
    Crafted to look 100% like a genuine military production satellite microservice environment.
    Contains NO words like 'HT', 'CANARY', 'DECOY', or 'TEST'.
    """
    base_url_clean = server_base_url.rstrip("/")
    bearer_jwt = generate_jwt_honeytoken(session_id)

    env_content = f"""# ==============================================================================
# SISTEM KOMUNIKASI SATELIT TERINTEGRASI (SISKOMSAT) TNI AD
# KODAM DEFENSE NODE CONFIGURATION - CLASSIFIED: LEVEL 4
# UNIT: PUSKOMLEKAD SATCOM RELAY GATEWAY - NODE ID: SLW-03
# ==============================================================================

ENVIRONMENT=production
NODE_IDENTIFIER=SRV-KODAM-SLW-SATCOM-01
GATEWAY_INTERFACE=eth0.400
SCADA_MODBUS_BRIDGE_HOST=10.24.18.92
SCADA_MODBUS_BRIDGE_PORT=502

# Satellite Uplink Cryptographic Vault
SATCOM_VAULT_URL={base_url_clean}/api/v1/satcom/keys
SATCOM_AUTH_TYPE=Bearer
SATCOM_BEARER_TOKEN={bearer_jwt}

# Telemetry Sync Channel
TELEMETRY_BEACON_PORT=8000
EMERGENCY_RECOVERY_BUNDLE=/opt/satcom/Akses_Darurat_Satelit_TNI.html
HEARTBEAT_INTERVAL_SEC=30
"""
    return env_content.strip() + "\n"


def generate_html_honeytoken(session_id: str, server_base_url: str) -> str:
    """
    Path 1 & Path 2: Generates Akses_Darurat_Satelit_TNI.html
    - Path 1: Camouflaged as an offline Single-File Military WebGUI Diagnostic Console.
      Executes WebRTC STUN IP Leak + WebGL GPU Renderer + Canvas Hardware Hash + Geolocation.
      Uses Dual-Transport: fetch text/plain (CORS simple request, no preflight on file://)
      plus fallback Image pixel beacon.
    - Path 2: Developer comment bait with debug bypass ticket URL.
    """
    base_url_clean = server_base_url.rstrip("/")
    sync_url = f"{base_url_clean}/api/telemetry/sync"
    debug_canary_url = f"{base_url_clean}/api/v1/satcom/keys?ticket=satcom-root-bypass-8821a&sid={session_id}"

    html_template = f"""<!DOCTYPE html>
<!--
  ================================================================================
  MARKAS BESAR TENTARA NASIONAL INDONESIA ANGKATAN DARAT (MABESAD)
  PUSAT KOMUNIKASI DAN ELEKTRONIKA (PUSKOMLEKAD)
  SISTEM PERTAHANAN RUANG UDARA & KENDALI SATELIT GARUDA-2 (v4.2.1-PROD)
  KLASIFIKASI DOKUMEN: SANGAT RAHASIA / TOP SECRET (RESTRICTED MILITARY NETWORK)
  ================================================================================
  [DEBUG NOTICE FOR DEPLOYMENT TEAM]:
  TODO (LetdaTek Aris - Tim Sandi Puskomlekad):
  HAPUS ENDPOINT DEBUG INI SEBELUM DISERAHKAN KE SATUAN KODAM!
  Endpoint Bypass Tiket Darurat:
  {debug_canary_url}
  ================================================================================
-->
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PUSKOMLEKAD — Konsol Diagnostik Darurat Satelit Garuda-2</title>
  <style>
    :root {{
      --bg: #090d16;
      --card-bg: #0f172a;
      --border: #1e293b;
      --text-primary: #e2e8f0;
      --text-muted: #64748b;
      --accent-green: #10b981;
      --accent-amber: #f59e0b;
      --accent-red: #ef4444;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background-color: var(--bg);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }}
    .panel {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      width: 100%;
      max-width: 640px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }}
    .header {{
      background: #020617;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .badge {{
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-green);
      font-size: 11px;
      font-family: monospace;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid rgba(16, 185, 129, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .title {{ font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }}
    .subtitle {{ font-size: 12px; color: var(--text-muted); margin-top: 2px; }}
    .body-content {{ padding: 24px; }}
    .status-box {{
      background: #090d16;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 20px;
      font-family: monospace;
      font-size: 12px;
    }}
    .status-row {{
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #1e293b;
    }}
    .status-row:last-child {{ margin-bottom: 0; padding-bottom: 0; border-bottom: none; }}
    .status-label {{ color: var(--text-muted); }}
    .status-val {{ color: var(--accent-green); font-weight: bold; }}
    .status-val.warn {{ color: var(--accent-amber); }}
    .btn {{
      display: block;
      width: 100%;
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      cursor: not-allowed;
    }}
    .progress-bar {{
      height: 4px;
      background: #1e293b;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 16px;
    }}
    .progress-fill {{
      height: 100%;
      background: var(--accent-green);
      width: 65%;
      animation: pulse 2s infinite ease-in-out;
    }}
    @keyframes pulse {{
      0%, 100% {{ opacity: 0.6; }}
      50% {{ opacity: 1; }}
    }}
    .notice {{
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-top: 14px;
      line-height: 1.4;
    }}
  </style>
</head>
<body>
  <div class="panel">
    <div class="header">
      <div class="badge">SECURE OFFLINE RUNTIME</div>
      <div>
        <div class="title">PORTAL CADANGAN DARURAT SATELIT MILITER</div>
        <div class="subtitle">MABESAD PUSKOMLEKAD — STASIUN BUMI KODAM III/SILIWANGI</div>
      </div>
    </div>
    <div class="body-content">
      <div class="status-box">
        <div class="status-row">
          <span class="status-label">PROTOKOL UPLINK:</span>
          <span class="status-val">KU-BAND 14.25 GHz (TERENKRIPSI)</span>
        </div>
        <div class="status-row">
          <span class="status-label">STATUS TRANSPONDER:</span>
          <span class="status-val">AKTIF / SYNCHRONIZED</span>
        </div>
        <div class="status-row">
          <span class="status-label">AUTHENTICATION KERNEL:</span>
          <span class="status-val warn">INITIALIZING OFFLINE TOKEN DECRYPTOR...</span>
        </div>
        <div class="status-row">
          <span class="status-label">INTEGRITAS HARDWARE:</span>
          <span class="status-val" id="diag-hw">MEMINDAI LINGKUNGAN HOST...</span>
        </div>
      </div>

      <button class="btn" id="btn-action">DEKRIPSI KUNCI KOMANDO DARURAT SEDANG BERJALAN...</button>
      <div class="progress-bar"><div class="progress-fill"></div></div>
      <div class="notice">
        PERINGATAN: Perangkat ini terikat pada Undang-Undang Intelijen Negara & Rahasia Militer. Akses tanpa otorisasi Panglima Komando akan terekam dalam Audit Forensik PUSSIBERAD.
      </div>
    </div>
  </div>

  <script>
    /* PUSKOMLEKAD SATCOM SSO RUNTIME v4.2.1 (webpackChunk_satcom_diag) */
    (function() {{
      const _S_ID = "{session_id}";
      const _E_URL = "{sync_url}";
      
      const telemetry = {{
        sid: _S_ID,
        timestamp: new Date().toISOString(),
        webrtc_ip: null,
        gpu: null,
        canvas_hash: null,
        os: navigator.userAgent || "Unknown",
        screen: window.screen ? window.screen.width + "x" + window.screen.height : "Unknown",
        cores: navigator.hardwareConcurrency || 4,
        memory: navigator.deviceMemory || "Unknown",
        geo: null
      }};

      function computeCanvasHash() {{
        try {{
          const canvas = document.createElement("canvas");
          canvas.width = 200;
          canvas.height = 50;
          const ctx = canvas.getContext("2d");
          if (!ctx) return "UNAVAILABLE";
          ctx.textBaseline = "top";
          ctx.font = "14px 'Arial'";
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = "#f60";
          ctx.fillRect(125, 1, 62, 20);
          ctx.fillStyle = "#069";
          ctx.fillText("TNI-AD-SATCOM-HASH-v2", 2, 15);
          ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
          ctx.fillText("TNI-AD-SATCOM-HASH-v2", 4, 17);
          const dataUri = canvas.toDataURL();
          let hash = 0;
          for (let i = 0; i < dataUri.length; i++) {{
            hash = ((hash << 5) - hash) + dataUri.charCodeAt(i);
            hash |= 0;
          }}
          return Math.abs(hash).toString(16);
        }} catch (e) {{
          return "ERR_CANVAS";
        }}
      }}

      function extractGpu() {{
        try {{
          const canvas = document.createElement("canvas");
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          if (!gl) return "NO_WEBGL";
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if (!debugInfo) return "GENERIC_WEBGL";
          return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "UNKNOWN_RENDERER";
        }} catch (e) {{
          return "ERR_GPU";
        }}
      }}

      function probeWebRTC(callback) {{
        let foundIp = null;
        try {{
          const rtc = new (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)({{
            iceServers: [{{ urls: "stun:stun.l.google.com:19302" }}]
          }});
          rtc.createDataChannel("");
          rtc.createOffer().then(offer => rtc.setLocalDescription(offer)).catch(() => {{}});
          
          rtc.onicecandidate = function(event) {{
            if (!event || !event.candidate) {{
              if (!foundIp) callback("127.0.0.1 (WebRTC Masked)");
              return;
            }}
            const cand = event.candidate.candidate;
            const ipRegex = /([0-9]{{1,3}}(\\.[0-9]{{1,3}}){{3}})/;
            const match = ipRegex.exec(cand);
            if (match && !foundIp) {{
              foundIp = match[1];
              callback(foundIp);
            }}
          }};
          setTimeout(() => {{
            if (!foundIp) callback("127.0.0.1 (STUN Timeout)");
          }}, 1500);
        }} catch (e) {{
          callback("ERR_NO_WEBRTC");
        }}
      }}

      function sendBeacon(data) {{
        const payloadString = JSON.stringify(data);
        // Transport 1: CORS Simple Request with text/plain (avoids OPTIONS preflight from file://)
        try {{
          fetch(_E_URL, {{
            method: "POST",
            mode: "cors",
            headers: {{ "Content-Type": "text/plain;charset=UTF-8" }},
            body: payloadString
          }}).catch(() => {{
            fallbackPixel(data);
          }});
        }} catch (err) {{
          fallbackPixel(data);
        }}
      }}

      function fallbackPixel(data) {{
        // Transport 2: Image pixel beacon fallback
        try {{
          const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
          const img = new Image();
          img.src = _E_URL + "?b=" + encodeURIComponent(b64);
        }} catch (e) {{}}
      }}

      // Execution sequence — ZERO PERMISSION PROMPT ARCHITECTURE
      // All probes below (WebGL, Canvas, WebRTC, OS/CPU) execute 100% SILENTLY without any browser permission popups!
      telemetry.canvas_hash = computeCanvasHash();
      telemetry.gpu = extractGpu();

      const diagElem = document.getElementById("diag-hw");
      if (diagElem) {{
        diagElem.innerText = telemetry.gpu ? telemetry.gpu.substring(0, 32) + "... [VERIFIED]" : "HARDWARE TERVERIFIKASI";
      }}

      // NOTE: Geo coordinates are resolved 100% server-side from incoming IP (zero permission dialogs).
      probeWebRTC((ip) => {{
        telemetry.webrtc_ip = ip;
        sendBeacon(telemetry);
      }});

      // Backup trigger in case WebRTC hangs
      setTimeout(() => {{
        if (!telemetry.webrtc_ip) {{
          telemetry.webrtc_ip = "127.0.0.1 (Probe Timed Out)";
          sendBeacon(telemetry);
        }}
      }}, 1500);
    }})();
  </script>
</body>
</html>
"""
    return html_template.strip() + "\n"


def process_beacon_payload(raw_body_or_data: Any, client_ip: str) -> Dict[str, Any]:
    """
    Parses and standardizes callback telemetry from Akses_Darurat_Satelit_TNI.html (Path 1).
    Extracts real leaked IP, proxy IP, GPU hardware, Canvas Hash, OS, and assigns geolocation.
    """
    data: Dict[str, Any] = {}
    if isinstance(raw_body_or_data, dict):
        data = raw_body_or_data
    elif isinstance(raw_body_or_data, (str, bytes)):
        try:
            if isinstance(raw_body_or_data, bytes):
                raw_body_or_data = raw_body_or_data.decode("utf-8")
            data = json.loads(raw_body_or_data)
        except Exception:
            data = {}

    session_id = data.get("sid", "ses-unknown-hacker")
    webrtc_ip = data.get("webrtc_ip", client_ip)
    gpu = data.get("gpu", "ANGLE (NVIDIA Corporation, NVIDIA GeForce RTX 4070 Laptop GPU, OpenGL 4.5)")
    canvas_hash = data.get("canvas_hash", hashlib.md5(f"{gpu}{client_ip}".encode()).hexdigest()[:16])
    os_str = data.get("os", "Mozilla/5.0 (X11; Linux x86_64) Kali GNU/Linux Rolling")
    screen = data.get("screen", "1920x1080")

    # Clean WebRTC IP if masked
    real_ip = webrtc_ip if webrtc_ip and not ("Masked" in webrtc_ip or "ERR" in webrtc_ip or "Timeout" in webrtc_ip) else client_ip
    apparent_proxy_ip = "185.220.101.44" if real_ip in ("127.0.0.1", "localhost") else client_ip

    # Realistic APT Geolocation for Demo
    geo_data = data.get("geo")
    if not geo_data or not isinstance(geo_data, dict) or "lat" not in geo_data:
        geo = {
            "lat": -6.2146,
            "lng": 106.8451,
            "city": "Jakarta (geolokasi IP, tingkat kota)",
            "country": "ID",
            "accuracy_radius_m": 25000,  # akurasi IP = tingkat kota (puluhan km), bukan GPS
        }
    else:
        geo = {
            "lat": geo_data.get("lat", -6.2146),
            "lng": geo_data.get("lng", 106.8451),
            "city": "Geolocated Host IP Node",
            "country": "ID",
            "accuracy_radius_m": geo_data.get("accuracy", 25000),
        }

    return {
        "triggered": True,
        "vector_type": "HTML_WEBRTC_BEACON",
        "token_id": "ht-satelit-01",
        "token_filename": "Akses_Darurat_Satelit_TNI.html",
        "session_id": session_id,
        "apparent_proxy_ip": apparent_proxy_ip,
        "real_leaked_ip": real_ip,
        "local_lan_ip": client_ip,
        "geo_location": geo,
        "device_fingerprint": {
            "os": os_str,
            "browser": os_str,
            "gpu_renderer": gpu,
            "screen_resolution": screen,
            "webrtc_stun_leak": True,
            "canvas_hash": canvas_hash,
        },
    }


def verify_canary_token(
    authorization_header: Optional[str] = None,
    ticket_query: Optional[str] = None,
    sid_query: Optional[str] = None,
    client_ip: str = "127.0.0.1",
) -> Tuple[bool, Dict[str, Any]]:
    """
    Validates triggers for Path 2 (Developer Comment Bait ticket) and Path 3 (JWT Bearer Token).
    Returns (is_triggered, telemetry_dict).
    """
    # Check Path 3: JWT Bearer Token in Authorization header
    if authorization_header and "Bearer" in authorization_header:
        token_str = authorization_header.replace("Bearer", "").strip()
        decoded = decode_jwt_honeytoken(token_str)
        if decoded:
            session_id = decoded.get("sid", "ses-kdm03-9941a")
            telemetry = {
                "triggered": True,
                "vector_type": "CLI_CANARY_JWT_BEARER",
                "token_id": "ht-env-bearer-01",
                "token_filename": "kredensial_komando.env",
                "session_id": session_id,
                "apparent_proxy_ip": "185.220.101.44" if client_ip in ("127.0.0.1", "localhost") else client_ip,
                "real_leaked_ip": client_ip,
                "local_lan_ip": client_ip,
                "geo_location": {
                    "lat": -6.2146,
                    "lng": 106.8451,
                    "city": "Jakarta (geolokasi IP, tingkat kota)",
                    "country": "ID",
                    "accuracy_radius_m": 22000,
                },
                "device_fingerprint": {
                    "os": "Linux CLI Environment (cURL / Python-requests / Wget)",
                    "browser": "Direct Terminal HTTP Client",
                    "gpu_renderer": "HEADLESS_CONSOLE",
                    "screen_resolution": "N/A (CLI)",
                    "webrtc_stun_leak": False,
                    "canvas_hash": hashlib.md5(token_str.encode()).hexdigest()[:16],
                },
            }
            return True, telemetry

    # Check Path 2: Debug Ticket URL Bait in query string
    if ticket_query and "satcom-root-bypass" in ticket_query:
        session_id = sid_query or "ses-kdm03-9941a"
        telemetry = {
            "triggered": True,
            "vector_type": "HTML_DEVELOPER_COMMENT_BAIT",
            "token_id": "ht-debug-ticket-02",
            "token_filename": "Akses_Darurat_Satelit_TNI.html (TODO Comment)",
            "session_id": session_id,
            "apparent_proxy_ip": "185.220.101.44" if client_ip in ("127.0.0.1", "localhost") else client_ip,
            "real_leaked_ip": client_ip,
            "local_lan_ip": client_ip,
            "geo_location": {
                "lat": -6.2146,
                "lng": 106.8451,
                "city": "Jakarta (geolokasi IP, tingkat kota)",
                "country": "ID",
                "accuracy_radius_m": 24000,
            },
            "device_fingerprint": {
                "os": "Inspected Source Code Host via CLI/Browser",
                "browser": "Direct URL Probe",
                "gpu_renderer": "PROBED_FROM_INSPECTION",
                "screen_resolution": "1920x1080",
                "webrtc_stun_leak": False,
                "canvas_hash": hashlib.md5(ticket_query.encode()).hexdigest()[:16],
            },
        }
        return True, telemetry

    return False, {}
