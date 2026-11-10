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

/** Kembali ke langkah sebelumnya: hasilnya ditampilkan lagi, serangannya tidak diulang. */
function BackButton({ guide }: { guide: Guide }) {
  if (guide.state.index === 0) return null;
  return (
    <Button variant="ghost" className="w-full" disabled={!guide.canBack} onClick={guide.back}>
      <Icon name="arrow-left-bold-duotone" className="h-4 w-4" />
      Kembali ke langkah {guide.state.index}
    </Button>
  );
}

export interface GuideSidebarProps {
  guide: Guide;
  /** WS ke ruang komando tersambung. Tanpa ini bukti langkah tidak bisa diterima, jadi aksi ditahan. */
  live: boolean;
}

export function GuideSidebar({ guide, live }: GuideSidebarProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { state, step } = guide;

  useEffect(() => {
    headingRef.current?.focus();
  }, [state.index]);

  const busy =
    state.phase === "running" ||
    state.phase === "awaiting" ||
    state.phase === "resetting";
  const blocked = busy || !live;

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
              Penyerang mengira menang, padahal dijebak sejak langkah pertama. Bukti setiap langkahnya tersimpan di ledger.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={state.phase === "resetting"}
                onClick={() => void guide.restart()}
              >
                <Icon name="restart-bold-duotone" className="h-4 w-4" /> Ulangi
                demo
              </Button>
              <BackButton guide={guide} />
            </div>
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
                    : state.phase === "resetting"
                      ? "Menyiapkan panggung demo…"
                      : busy
                        ? "Menunggu respons sistem…"
                        : !live
                          ? "Menunggu koneksi ke ruang komando. Aksi dibuka setelah status di kanan atas menjadi Terhubung."
                          : step.before}
            </p>
            <div className="mt-5 flex flex-col gap-2">
            {state.phase === "done" ? (
              <Button className="w-full" onClick={guide.next}>
                Lanjut{" "}
                <Icon name="arrow-right-bold-duotone" className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={state.phase === "failed" ? "danger" : "primary"}
                disabled={blocked}
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
            <BackButton guide={guide} />
            </div>
          </>
        )}
        {guide.warning && (
          <p className="mt-3 text-xs text-ink-mute">{guide.warning}</p>
        )}
      </div>
    </aside>
  );
}
