import Link from "next/link";
import { LandingHero, LandingSteps } from "@/components/landing/LandingMotion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <p className="text-sm font-semibold text-ink-soft">
            PUSSIBERAD · Kartika Cyber Hackathon 2026
          </p>
          <p className="text-sm text-ink-mute">
            Kategori 02 · Defensive Shield
          </p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:py-20">
        <LandingHero />
        <LandingSteps />

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-ink-mute">Mode bebas:</span>
          <Link
            href="/command-center"
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Ruang komando →
          </Link>
          <Link
            href="/target-portal"
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Portal penyerang →
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-sm leading-relaxed text-ink-mute">
          <p>
            Catatan: portal &quot;asli&quot;, sabotase radar, dan broadcast 15
            Kodam adalah simulasi terkontrol untuk demonstrasi. Tidak ada
            perintah sistem nyata yang dijalankan. Lokasi penyerang dari IP
            hanya akurat sampai tingkat kota. Terminal penyerang dijawab oleh
            virtual file system deterministik.
          </p>
          <p>Ikon: Solar Icons (CC BY 4.0).</p>
        </div>
      </footer>
    </main>
  );
}
