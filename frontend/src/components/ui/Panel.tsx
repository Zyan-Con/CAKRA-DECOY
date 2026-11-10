import type { ReactNode } from "react";

export type PanelFocus = "active" | "dim" | "none";

export interface PanelProps {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  focus?: PanelFocus;
  className?: string;
  children: ReactNode;
}

const FOCUS: Record<PanelFocus, string> = {
  active: "border-signal",
  dim: "border-line opacity-50",
  none: "border-line",
};

/** Permukaan dasar ruang komando. `focus` menyorot panel yang relevan untuk langkah aktif. */
export function Panel({
  title,
  eyebrow,
  action,
  focus = "none",
  className = "",
  children,
}: PanelProps) {
  return (
    <section
      className={`rounded-md border bg-panel p-5 transition-[opacity,border-color] duration-200 ${FOCUS[focus]} ${className}`}
    >
      {(title || eyebrow || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-mute">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-lg font-bold leading-tight text-ink">
                {title}
              </h2>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
