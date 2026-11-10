import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { STEPS } from "@/lib/attack-steps";

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
        <p className="text-sm font-semibold text-signal">
          CAKRA-DECOY 2.0 · Active Deception Gateway
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Penyerang mengira dia menang, padahal dia sedang dijebak dan ditonton.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          CAKRA-DECOY tidak memblokir penyerang di depan pintu. Ia membelokkan
          penyerang ke portal tiruan, menyadap setiap langkahnya, membongkar
          identitasnya, lalu menyebarkan vaksin ke seluruh Kodam.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/demo"
            className="inline-flex min-h-[52px] items-center gap-2 rounded-sm bg-signal px-6 text-base font-bold text-bg hover:brightness-110"
          >
            <Icon name="play-bold-duotone" className="h-5 w-5" />
            Mulai demo terpandu
          </Link>
          <p className="text-sm text-ink-mute">
            5 langkah, sekitar 2 menit. Setiap tombol menjalankan serangan
            sungguhan ke sistem.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.id} className="bg-panel p-5">
              <p className="font-data text-sm text-signal">0{i + 1}</p>
              <p className="mt-2 text-base font-bold leading-snug text-ink">
                {s.title}
              </p>
              <p className="mt-2 text-xs text-ink-mute">{s.technical}</p>
            </div>
          ))}
        </div>

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
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs leading-relaxed text-ink-mute">
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
