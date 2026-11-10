/**
 * Lima langkah serangan yang dipakai bersama oleh mode guide (/demo) dan penyerang otomatis.
 * Setiap langkah memanggil API sungguhan lewat StepContext, sehingga lewat detektor, ledger, dan peta Kodam.
 */
import { api } from "@/lib/api";
import type { EventType, TacticalEnvelope } from "@/lib/types";

export type StepId =
  | "masuk"
  | "disadap"
  | "sabotase"
  | "dibongkar"
  | "divaksin";
export type PortalControl = "login" | "terminal" | "radar" | "bait";
export type CommandPanelId =
  | "alert"
  | "terminal"
  | "radar"
  | "identity"
  | "kodam"
  | "mitre"
  | "ledger";

export const SQLI_CREDENTIALS = {
  username: "admin' OR '1'='1 --",
  password: "bypass",
} as const;
export const STEP2_COMMAND = "cat /opt/satcom/kredensial_komando.env";

export interface StepContext {
  /** Resolve session token. */
  login(username: string, password: string): Promise<string>;
  command(raw: string): Promise<void>;
  overrideRadar(): Promise<void>;
  /** Simulasi penyerang membuka file umpan HTML, dengan data contoh. */
  openBait(): Promise<void>;
  vaccinate(): Promise<void>;
}

export interface StepDef {
  id: StepId;
  title: string;
  technical: string;
  before: string;
  after: string;
  actionLabel: string;
  event: EventType;
  portalControl: PortalControl | null;
  panels: CommandPanelId[];
  run(ctx: StepContext): Promise<void>;
}

export const STEPS: readonly StepDef[] = [
  {
    id: "masuk",
    title: "Penyerang dibelokkan diam-diam",
    technical: "Opaque Silent Interceptor",
    before:
      "Penyerang mencoba masuk dengan SQL injection. Lihat apa yang ia terima di kiri, dan apa yang kita lihat di kanan.",
    after:
      "Penyerang mengira login berhasil. Sebenarnya ia sudah dibelokkan ke portal jebakan, dan ruang komando langsung menerima alert.",
    actionLabel: "Login sebagai penyerang (SQLi)",
    event: "INTERCEPTION_ALERT",
    portalControl: "login",
    panels: ["alert"],
    run: async (ctx) => {
      await ctx.login(SQLI_CREDENTIALS.username, SQLI_CREDENTIALS.password);
    },
  },
  {
    id: "disadap",
    title: "Setiap ketikan penyerang terlihat",
    technical: "Chameleon Mirror-Twin · VFS",
    before: "Penyerang mulai menjelajahi server palsu dan mencari kredensial.",
    after:
      "Terminal yang ia pakai palsu, tapi konsisten. Setiap perintahnya muncul di ruang komando dan dipetakan ke MITRE ATT&CK.",
    actionLabel: "Jalankan perintah penyerang",
    event: "TERMINAL_COMMAND_EXECUTED",
    portalControl: "terminal",
    panels: ["terminal", "mitre"],
    run: async (ctx) => {
      await ctx.command(STEP2_COMMAND);
    },
  },
  {
    id: "sabotase",
    title: "Penyerang mengira radar sudah ia rusak",
    technical: "Ilusi kendali OT/SCADA",
    before: "Penyerang mencoba mematikan pendingin radar lewat panel SCADA.",
    after:
      "Di layarnya radar overheat 115.8°C. Radar yang asli tetap 34.0°C, karena perintahnya tidak pernah sampai.",
    actionLabel: "Override pendingin radar",
    event: "OT_SABOTAGE_ATTEMPT",
    portalControl: "radar",
    panels: ["radar"],
    run: async (ctx) => {
      await ctx.overrideRadar();
    },
  },
  {
    id: "dibongkar",
    title: "Umpan membongkar identitas penyerang",
    technical: "Boomerang Honeytoken · data contoh",
    before:
      "Penyerang menemukan file umpan berisi akses darurat satelit, lalu membukanya.",
    after:
      "File umpan mengirim balik IP asli, perangkat, dan lokasi tingkat kota penyerang. Yang tampil di sini adalah data contoh, bukan data perangkatmu.",
    actionLabel: "Penyerang membuka file umpan",
    event: "HONEYTOKEN_TRIGGERED",
    portalControl: "bait",
    panels: ["identity"],
    run: async (ctx) => {
      await ctx.openBait();
    },
  },
  {
    id: "divaksin",
    title: "Seluruh Kodam kebal dari serangan ini",
    technical: "Herd Immunity · iptables/ModSecurity",
    before:
      "Pola serangan dan IP asli penyerang sudah diketahui. Saatnya melindungi satuan lain.",
    after:
      "Rule blokir dibuat otomatis dan disebar ke 15 Kodam. Serangan yang sama tidak akan berhasil di tempat lain.",
    actionLabel: "Sebarkan vaksin ke Kodam",
    event: "IMMUNITY_BROADCASTED",
    portalControl: null,
    panels: ["kodam"],
    run: async (ctx) => {
      await ctx.vaccinate();
    },
  },
];

export function findStepEvent(
  log: readonly TacticalEnvelope[],
  step: StepId,
  sessionId: string | null,
): boolean {
  if (sessionId === null) return false;
  const event = STEPS.find((s) => s.id === step)?.event;
  return log.some((e) => e.event_type === event && e.session_id === sessionId);
}

/** StepContext tanpa UI, untuk penyerang otomatis. Token disimpan setelah login. */
export function createApiStepContext(): StepContext & {
  sessionId(): string | null;
} {
  let token: string | null = null;
  const need = (): string => {
    if (!token) throw new Error("Belum login");
    return token;
  };
  return {
    sessionId: () => token,
    login: async (username, password) => {
      token = (await api.login(username, password)).session_token;
      return token;
    },
    command: async (raw) => {
      await api.sysConsole(need(), raw);
    },
    overrideRadar: async () => {
      await api.otControl(need(), "OVERRIDE_VOLTAGE", "RADAR_COOLING");
    },
    openBait: async () => {
      await api.triggerTelemetryBeacon(need());
    },
    vaccinate: async () => {
      await api.immunityBroadcast(need());
    },
  };
}
