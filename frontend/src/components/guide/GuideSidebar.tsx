"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { STEPS } from "@/lib/attack-steps";
import { CLOSING_INDEX } from "@/lib/guide-machine";
import type { Guide } from "@/lib/useGuide";

const NOT_DIVERTED =
  "Login ini dianggap sah, jadi diteruskan ke portal asli. Sekarang coba sebagai penyerang.";

function StepList({ guide }: { guide: Guide }) {
  const { index, phase } = guide.state;
  return (
    <ol className="space-y-1.5">
      {STEPS.map((s, i) => {
        const done = i < index || (i === index && phase === "done");
        const active = i === index && !done;
        return (
          <li
            key={s.id}
            aria-current={active ? "step" : undefined}
            className={`flex items-center gap-2.5 text-sm ${done ? "text-safe" : active ? "font-semibold text-signal" : "text-ink-mute"}`}
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-data text-xs ${
                done ? "border-safe" : active ? "border-signal" : "border-line"
              }`}
            >
              {done ? (
                <Icon name="check-circle-bold-duotone" className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </span>
            {s.title}
          </li>
        );
      })}
    </ol>
  );
}

export function GuideSidebar({ guide }: { guide: Guide }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { state, step } = guide;

  useEffect(() => {
    headingRef.current?.focus();
  }, [state.index]);

  const busy = state.phase === "running" || state.phase === "awaiting";

  return (
    <aside className="flex flex-col gap-6 rounded-md border border-line bg-panel p-5 min-[1100px]:sticky min-[1100px]:top-4">
      <StepList guide={guide} />

      <div className="border-t border-line pt-5">
        {state.index >= CLOSING_INDEX || !step ? (
          <>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-extrabold leading-tight text-ink focus:outline-none focus-visible:outline-none"
            >
              Demo selesai
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Penyerang mengira dia menang, padahal sejak langkah pertama dia
              dijebak dan ditonton. Bukti setiap langkahnya tersimpan di ledger.
            </p>
            <Button
              className="mt-5 w-full"
              onClick={() => void guide.restart()}
            >
              <Icon name="restart-bold-duotone" className="h-4 w-4" /> Ulangi
              demo
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-ink-mute">
              Langkah {state.index + 1} dari {STEPS.length} · {step.technical}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-1 text-2xl font-extrabold leading-tight text-ink focus:outline-none focus-visible:outline-none"
            >
              {step.title}
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed text-ink-soft"
              aria-live="polite"
            >
              {state.phase === "done"
                ? step.after
                : state.phase === "not-diverted"
                  ? NOT_DIVERTED
                  : state.phase === "failed"
                    ? `Gagal: ${state.error}`
                    : busy
                      ? "Menjalankan aksi penyerang…"
                      : step.before}
            </p>
            {state.phase === "done" ? (
              <Button className="mt-5 w-full" onClick={guide.next}>
                Lanjut{" "}
                <Icon name="arrow-right-bold-duotone" className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="mt-5 w-full"
                variant={state.phase === "failed" ? "danger" : "primary"}
                disabled={busy}
                onClick={() => void guide.run()}
              >
                {busy ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent"
                    aria-hidden
                  />
                ) : (
                  <Icon
                    name={
                      state.phase === "failed"
                        ? "restart-bold-duotone"
                        : "play-bold-duotone"
                    }
                    className="h-4 w-4"
                  />
                )}
                {state.phase === "failed" ? "Coba lagi" : step.actionLabel}
              </Button>
            )}
          </>
        )}
        {guide.warning && (
          <p className="mt-3 text-xs text-ink-mute">{guide.warning}</p>
        )}
      </div>
    </aside>
  );
}
