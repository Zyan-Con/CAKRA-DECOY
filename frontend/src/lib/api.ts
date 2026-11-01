const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = (body as { detail?: string })?.detail ?? JSON.stringify(body);
    } catch {
      /* keep statusText */
    }
    throw new ApiError(`Backend ${res.status} pada ${path} — ${detail}`);
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

  otControl: (
    sessionToken: string,
    action: string,
    targetSystem: string,
  ) =>
    apiFetch<OtControlResponse>("/api/ot/control", {
      method: "POST",
      body: JSON.stringify({ session_token: sessionToken, action, target_system: targetSystem }),
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

  exportPdfUrl: (sessionToken?: string) =>
    `${BASE_URL}/api/forensic/export-pdf?session_token=${sessionToken ?? ""}`,

  honeytokenDownloadUrl: (filename: string, sessionToken?: string) =>
    `${BASE_URL}/api/vfs/download/${filename}?session_token=${sessionToken ?? ""}`,
};
