import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

// Domain fiktif (.local) dengan sengaja: portal ini jebakan, bukan tiruan situs instansi sungguhan.
export const PORTAL_URL = "logistik.kodam-demo.local";

/** Kop portal instansi. Dipakai di dalam bingkai (/demo) maupun halaman penuh (/target-portal). */
export function PortalHeader({ className = "px-5" }: { className?: string }) {
  return (
    <div className="border-b border-gov-line bg-gov-brand py-3 text-white">
      <div className={className}>
        <p className="text-sm font-semibold">
          Portal Logistik &amp; Kendali SCADA Kodam
        </p>
        <p className="text-xs text-white/80">
          Sistem Pertahanan Logistik Terpadu · Akses Terbatas
        </p>
      </div>
    </div>
  );
}

/** Bingkai browser terang untuk layout terbelah /demo: menegaskan bahwa ini layar yang dilihat penyerang. */
export function PortalFrame({
  children,
  url = PORTAL_URL,
}: {
  children: ReactNode;
  url?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-gov-line bg-gov-bg font-gov text-gov-ink shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 border-b border-gov-line bg-white px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E7EB]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E7EB]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E7EB]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2 rounded bg-gov-bg px-3 py-1 text-xs text-gov-soft">
          <Icon
            name="lock-keyhole-bold-duotone"
            className="h-3.5 w-3.5 shrink-0"
          />
          <span className="truncate">https://{url}</span>
        </span>
      </div>
      <PortalHeader />
      <div className="p-5">{children}</div>
    </div>
  );
}
