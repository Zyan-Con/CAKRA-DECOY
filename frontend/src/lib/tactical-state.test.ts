import { describe, expect, test } from "vitest";
import {
  LOG_CAP,
  ownTamperTarget,
  appendLog,
  deriveTactical,
  initialTacticalState,
  reduceTactical,
} from "@/lib/tactical-state";
import type {
  EventType,
  ForensicBlock,
  KodamNode,
  StateSnapshot,
  TacticalEnvelope,
} from "@/lib/types";

let seq = 0;
function env(
  event_type: EventType,
  payload: unknown,
  session_id: string | null,
): TacticalEnvelope {
  seq += 1;
  return {
    schema_version: "2.0",
    event_id: `e${seq}`,
    event_type,
    timestamp: "2026-11-10T00:00:00Z",
    session_id,
    seq,
    payload,
  };
}

const kodam = (
  id: string,
  status: KodamNode["status"] = "STANDBY",
): KodamNode => ({
  kodam_id: id,
  name: id,
  lat: 0,
  lng: 0,
  status,
});

const block = (
  block_index: number,
  session_id: string | null,
): ForensicBlock => ({
  block_index,
  timestamp: "t",
  action_summary: `blok ${block_index}`,
  previous_hash: "p",
  current_hash: `h${block_index}`,
  chain_integrity: "VALID_IMMUTABLE",
  session_id,
});

const alertPayload = {
  threat_score: 70,
  entry_vector: "SQL_INJECTION_AUTH_BYPASS",
  routing_mode: "DECOY_MIRROR_TWIN",
  interception_latency_ms: 0.05,
};

const terminal = (command_id: string) => ({
  command_id,
  cwd: "/opt/satcom",
  prompt: "ubuntu@srv:/opt/satcom$",
  raw_input: "whoami",
  simulated_output: "ubuntu",
  execution_source: "VFS_DETERMINISTIC_ENGINE",
  response_time_ms: 0,
});

const honeytoken = {
  vector_type: "HTML_WEBRTC_BEACON",
  token_id: "t1",
  token_filename: "Akses_Darurat_Satelit_TNI.html",
  apparent_proxy_ip: "185.220.101.44",
  real_leaked_ip: "103.147.12.89",
  geo_location: {
    lat: -6.2,
    lng: 106.8,
    city: "Jakarta",
    country: "ID",
    accuracy_radius_m: 25000,
  },
};

function snapshot(over: Partial<StateSnapshot> = {}): StateSnapshot {
  return {
    sessions: [],
    terminal_history: [],
    mitre_techniques: [],
    kodam_nodes: [kodam("KODAM-III"), kodam("KODAM-JAYA")],
    forensic_ledger: [block(0, null)],
    latest_alert: null,
    latest_ot: null,
    latest_honeytoken: null,
    latest_immunity: null,
    ...over,
  };
}

describe("unscoped (mode bebas)", () => {
  test("unscoped snapshot replaces state", () => {
    const s = reduceTactical(
      initialTacticalState,
      env(
        "INITIAL_STATE_SYNC",
        snapshot({ terminal_history: [terminal("c1")] as never }),
        null,
      ),
      undefined,
    );
    expect(s.kodamNodes).toHaveLength(2);
    expect(s.terminalHistory).toHaveLength(1);
    expect(s.ledger).toHaveLength(1);
  });

  test("unscoped alert sets latestSessionId and marks KODAM-III UNDER_DECEPTION", () => {
    const s = deriveTactical(
      [
        env("INITIAL_STATE_SYNC", snapshot(), null),
        env("INTERCEPTION_ALERT", alertPayload, "A"),
      ],
      undefined,
    );
    expect(s.latestSessionId).toBe("A");
    expect(s.alert?.threat_score).toBe(70);
    expect(s.kodamNodes.find((k) => k.kodam_id === "KODAM-III")?.status).toBe(
      "UNDER_DECEPTION",
    );
  });
});

describe("scoped (mode guide)", () => {
  test("scoped drops events from other sessions", () => {
    const s = deriveTactical(
      [env("TERMINAL_COMMAND_EXECUTED", terminal("c1"), "B")],
      { sessionId: "A" },
    );
    expect(s.terminalHistory).toHaveLength(0);
  });

  test("scoped keeps null-session integrity alert", () => {
    const s = deriveTactical(
      [
        env(
          "FORENSIC_INTEGRITY_ALERT",
          {
            block_index: 1,
            chain_integrity: "TAMPERED_CRITICAL",
            tampered_block_index: 1,
            action_summary: "x",
          },
          null,
        ),
      ],
      { sessionId: "A" },
    );
    expect(s.integrity).toBe("TAMPERED_CRITICAL");
  });

  test("scoped ledger keeps genesis and own blocks only", () => {
    const s = deriveTactical(
      [
        env(
          "INITIAL_STATE_SYNC",
          snapshot({
            forensic_ledger: [block(0, null), block(1, "B"), block(2, "A")],
          }),
          null,
        ),
      ],
      { sessionId: "A" },
    );
    expect(s.ledger.map((b) => b.block_index)).toEqual([0, 2]);
  });

  test("scoped snapshot does not wipe own terminal/alert/honeytoken", () => {
    const s = deriveTactical(
      [
        env("INTERCEPTION_ALERT", alertPayload, "A"),
        env("TERMINAL_COMMAND_EXECUTED", terminal("c1"), "A"),
        env("HONEYTOKEN_TRIGGERED", honeytoken, "A"),
        env(
          "INITIAL_STATE_SYNC",
          snapshot({ kodam_nodes: [kodam("KODAM-JAYA", "STANDBY")] }),
          null,
        ),
      ],
      { sessionId: "A" },
    );
    expect(s.alert).not.toBeNull();
    expect(s.terminalHistory[0]?.command_id).toBe("c1");
    expect(s.honeytoken?.real_leaked_ip).toBe("103.147.12.89");
    expect(s.kodamNodes).toEqual([kodam("KODAM-JAYA", "STANDBY")]);
  });

  test("alert before scope is known still shows once scope set", () => {
    const log = [env("INTERCEPTION_ALERT", alertPayload, "A")];
    expect(deriveTactical(log, { sessionId: null }).alert).toBeNull();
    expect(deriveTactical(log, { sessionId: "A" }).alert).not.toBeNull();
  });

  test("scoped snapshot keeps only own session", () => {
    const sessions = [
      {
        session_id: "A",
        routing_mode: "DECOY_MIRROR_TWIN",
        threat_score: 70,
        entry_vector: "x",
        cwd: "/",
        status: "ACTIVE",
        started_at: "t",
      },
      {
        session_id: "B",
        routing_mode: "DECOY_MIRROR_TWIN",
        threat_score: 70,
        entry_vector: "x",
        cwd: "/",
        status: "ACTIVE",
        started_at: "t",
      },
    ];
    const s = deriveTactical(
      [env("INITIAL_STATE_SYNC", snapshot({ sessions } as never), null)],
      { sessionId: "A" },
    );
    expect(s.sessions.map((x) => x.session_id)).toEqual(["A"]);
  });
});

test("terminal events dedupe by command_id", () => {
  const s = deriveTactical(
    [
      env("TERMINAL_COMMAND_EXECUTED", terminal("c1"), "A"),
      env("TERMINAL_COMMAND_EXECUTED", terminal("c1"), "A"),
    ],
    undefined,
  );
  expect(s.terminalHistory).toHaveLength(1);
});

test("appendLog caps at LOG_CAP", () => {
  let log: TacticalEnvelope[] = [];
  const all: TacticalEnvelope[] = [];
  for (let i = 0; i < LOG_CAP + 1; i += 1) {
    const e = env("TERMINAL_COMMAND_EXECUTED", terminal(`c${i}`), "A");
    all.push(e);
    log = appendLog(log, e);
  }
  expect(log).toHaveLength(LOG_CAP);
  expect(log[0]).toBe(all[1]);
});

describe("ownTamperTarget", () => {
  test("picks the first non-genesis block of the session", () => {
    expect(ownTamperTarget([block(0, null), block(1, "B"), block(2, "A"), block(3, "A")], "A")).toBe(2);
  });

  test("returns null when the session has no block", () => {
    expect(ownTamperTarget([block(0, null), block(1, "B")], "A")).toBeNull();
    expect(ownTamperTarget([block(1, "B")], null)).toBeNull();
  });
});

test("scoped snapshot keeps own vaccination after another browser resets", () => {
  const immune = [kodam("KODAM-JAYA", "IMMUNE_PROTECTED")];
  const imm = {
    broadcast_active: true,
    generated_rule: { rule_id: "R1", iptables_cmd: "iptables -A", modsec_rule: "SecRule" },
    kodam_nodes_status: immune,
  };
  const s = deriveTactical(
    [env("IMMUNITY_BROADCASTED", imm, "A"), env("INITIAL_STATE_SYNC", snapshot({ kodam_nodes: [kodam("KODAM-JAYA")] }), null)],
    { sessionId: "A" },
  );
  expect(s.kodamNodes).toEqual(immune);
  expect(s.broadcast?.generated_rule.rule_id).toBe("R1");
});

test("appendLog keeps the full ledger only on the newest integrity event", () => {
  const fia = (n: number) =>
    env("FORENSIC_INTEGRITY_ALERT", { block_index: n, chain_integrity: "VALID_IMMUTABLE", action_summary: "x", ledger: [block(0, null), block(n, "A")] }, "A");
  const log = appendLog(appendLog([], fia(1)), fia(2));
  expect((log[0].payload as { ledger?: unknown[] }).ledger).toBeUndefined();
  expect((log[1].payload as { ledger?: unknown[] }).ledger).toHaveLength(2);
  expect(deriveTactical(log, undefined).ledger.map((b) => b.block_index)).toEqual([0, 2]);
});

test("unscoped empty snapshot (data cleared) forgets the latest session", () => {
  const s = deriveTactical(
    [env("INTERCEPTION_ALERT", alertPayload, "A"), env("INITIAL_STATE_SYNC", snapshot({ sessions: [] }), null)],
    undefined,
  );
  expect(s.latestSessionId).toBeNull();
  expect(s.alert).toBeNull();
  expect(s.sessions).toEqual([]);
});
