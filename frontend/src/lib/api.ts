import type { ChainIntegrity } from "@/lib/types";

// Production (browser): same-origin lewat reverse proxy Caddy pada path /api.
// Development (browser): backend lokal langsung di localhost:8000.
// SSR/server: izinkan override eksplisit bila disediakan.
const BASE_URL = (() => {
  if (typeof window !== "undefined") {
    return process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
})();

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** Batas tunggu respons backend; tanpa ini sidebar /demo bisa tertahan di "running" sampai timeout proxy (~100 dtk). */
export const API_TIMEOUT_MS = 15000;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    // Pesan browser ("Failed to fetch", "AbortError") tidak jelas bagi juri.
    throw new ApiError(
      controller.signal.aborted
        ? "Server tidak merespons. Coba lagi sebentar lagi."
        : "Server tidak bisa dihubungi. Periksa koneksi, lalu coba lagi.",
    );
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = (body as { detail?: string })?.detail ?? JSON.stringify(body);
    } catch {
      /* keep statusText */
    }
    throw new ApiError(`Backend ${res.status} pada ${path} · ${detail}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export interface LoginResponse {
  status: string;
  operator_role: string;
  clearance_level: string;
  session_token: string;
}

export interface PortalState {
  unit: string;
  logistics?: Array<{ item: string; stock: number; depot: string }>;
  scada?: {
    radar_cooling_temp_c: number;
    cooling_status: string;
    generator: string;
  };
}

export interface ConsoleResponse {
  output: string;
  cwd: string;
  prompt: string;
  command_id?: string;
  execution_source?: string;
}

export interface OtControlResponse {
  status: string;
  radar_cooling_temp_c: number;
  cooling_status: string;
}

export interface ImmunityResponse {
  status: string;
  nodes_updated?: number;
  immune_count?: number;
  rule?: {
    rule_id: string;
    iptables_cmd: string;
    modsec_rule: string;
  };
}

export const api = {
  login: (username: string, password: string) =>
    apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  portalState: (sessionToken: string) =>
    apiFetch<PortalState>(`/api/portal/state?session_token=${sessionToken}`),

  otControl: (sessionToken: string, action: string, targetSystem: string) =>
    apiFetch<OtControlResponse>("/api/ot/control", {
      method: "POST",
      body: JSON.stringify({
        session_token: sessionToken,
        action,
        target_system: targetSystem,
      }),
    }),

  sysConsole: (sessionToken: string, command: string) =>
    apiFetch<ConsoleResponse>("/api/sys/console", {
      method: "POST",
      body: JSON.stringify({ session_token: sessionToken, command }),
    }),

  immunityBroadcast: (sessionToken: string) =>
    apiFetch<ImmunityResponse>("/api/immunity/broadcast", {
      method: "POST",
      body: JSON.stringify({ session_token: sessionToken }),
    }),

  tamperTest: (blockIndex: number) =>
    apiFetch<{ is_valid?: boolean; tampered_block_index?: number | null }>(
      "/api/forensic/tamper-test",
      { method: "POST", body: JSON.stringify({ block_index: blockIndex }) },
    ),

  restoreLedger: () =>
    apiFetch<{ is_valid?: boolean }>("/api/forensic/restore", {
      method: "POST",
      body: JSON.stringify({}),
    }),

  /** Kembalikan panggung demo: Kodam STANDBY, vaksin dicabut, rantai bukti dipulihkan bila rusak. */
  demoReset: () =>
    apiFetch<{ status: string; chain_integrity: ChainIntegrity }>(
      "/api/demo/reset",
      { method: "POST" },
    ),

  /** Hapus semua data demo di server (sesi, terminal, MITRE, Kodam, ledger kembali ke genesis). */
  demoClear: () =>
    apiFetch<{ status: string }>("/api/demo/clear", { method: "POST" }),

  exportPdfUrl: (sessionToken?: string) =>
    `${BASE_URL}/api/forensic/export-pdf?session_token=${sessionToken ?? ""}`,

  honeytokenDownloadUrl: (filename: string, sessionToken?: string) =>
    `${BASE_URL}/api/vfs/download/${filename}?session_token=${sessionToken ?? ""}`,

  triggerTelemetryBeacon: (sessionToken: string) => {
    const beacon = {
      sid: sessionToken,
      session_id: sessionToken,
      webrtc_ip: "103.147.12.89",
      local_ip: "192.168.1.45",
      gpu: "ANGLE (NVIDIA GeForce RTX 4070 Laptop GPU, OpenGL 4.5)",
      canvas_hash: "e4b89100a2c7f91d",
      os: "Mozilla/5.0 (X11; Linux x86_64) Chrome/131.0.0.0",
      screen: "1920x1080",
    };
    const b64 = btoa(JSON.stringify(beacon));
    return apiFetch<{ status: string; vector?: string; real_ip?: string }>(
      `/api/telemetry/sync?b=${encodeURIComponent(b64)}`,
    );
  },

  triggerCanaryToken: (sessionToken: string) =>
    apiFetch<{ status: string; vector?: string; real_ip?: string }>(
      `/api/v1/satcom/keys?sid=${encodeURIComponent(sessionToken)}`,
    ),

  triggerDebugTicket: (sessionToken: string) =>
    apiFetch<{ status: string; vector?: string; real_ip?: string }>(
      `/api/v1/debug/ticket?id=9941&sid=${encodeURIComponent(sessionToken)}`,
    ),
};
