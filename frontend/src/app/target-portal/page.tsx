"use client";

import { useEffect, useState } from "react";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { PortalHeader } from "@/components/portal/PortalFrame";
import { PortalLogin } from "@/components/portal/PortalLogin";
import { PresenterStrip } from "@/components/portal/PresenterStrip";
import { usePortalSession } from "@/lib/usePortalSession";

/**
 * Portal penyerang sebagai halaman penuh, tanpa bingkai dan tanpa petunjuk jebakan:
 * bisa diserang langsung (browser, curl, Burp) seperti sistem sungguhan.
 * Tombol presenter hanya muncul lewat /target-portal?panel=1.
 */
export default function TargetPortalPage() {
  const session = usePortalSession();
  const [presenter, setPresenter] = useState(false);

  useEffect(() => {
    // Dibaca di client: useSearchParams di halaman statis butuh Suspense boundary.
    setPresenter(
      new URLSearchParams(window.location.search).get("panel") === "1",
    );
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg font-gov text-gov-ink">
      {presenter && <PresenterStrip session={session} />}
      <PortalHeader className="mx-auto max-w-5xl px-4" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {session.auth ? (
          <PortalDashboard session={session} baitMode="real" />
        ) : (
          <PortalLogin
            onSubmit={(u, p) => void session.login(u, p).catch(() => undefined)}
            busy={session.busy}
            error={session.error}
          />
        )}
      </div>
      <footer className="border-t border-gov-line bg-white">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-gov-soft">
          Sistem ini diawasi. Akses tanpa otorisasi dicatat dan diproses sesuai
          ketentuan.
        </p>
      </footer>
    </main>
  );
}
