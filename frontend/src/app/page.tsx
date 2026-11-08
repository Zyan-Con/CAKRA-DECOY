import Link from "next/link";
import { Icon } from "@/lib/icon";

export const metadata = {
  title: "CAKRA-DECOY 2.0 · Launcher",
  description:
    "Cyber Autonomous Kernel-less Routing & Active Deception System · PUSSIBERAD Kartika Cyber Hackathon 2026.",
};

const SPECS = [
  { k: "Intersepsi payload", v: "< 5 ms", icon: "pulse" },
  { k: "Terminal VFS stateful", v: "< 2 ms", icon: "terminal-window" },
  { k: "Mode AI", v: "Groq · Gemini · Ollama", icon: "cpu" },
  { k: "Jejak forensik", v: "SHA-256 hash-chain", icon: "seal-check" },
];

const PILLARS = [
  {
    icon: "crosshair-simple",
    title: "Opaque Silent Interceptor",
    body: "Deteksi SQLi, RCE, path traversal, dan anomali SCADA, lalu belokkan sesi penyerang ke Mirror-Twin tanpa membocorkan status decoy di DevTools.",
  },
  {
    icon: "terminal-window",
    title: "Chameleon AI Mirror-Twin",
    body: "Web-SSH hibrida: VFS deterministik instan, context-shell LLM, dan static fallback yang konsisten walau jaringan panggung terputus.",
  },
  {
    icon: "fingerprint",
    title: "Boomerang Honeytoken",
    body: "Umpan tiga jalur (HTML WebRTC, CLI canary JWT, source bait) membongkar IP asli, perangkat keras, dan geolokasi penyerang.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Pita navy (porsi sekunder 20%) */}
      <div className="bg-ink text-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5 font-mono text-[10px] tracking-milli">
          <span className="text-white">PUSSIBERAD · PUSAT SIBER TNI AD</span>
          <span className="hidden text-white/55 sm:inline">KARTIKA CYBER SHIELD · KATEGORI 02 PENANGKALAN</span>
          <span className="text-accent-line">RAHASIA</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-14">
        {/* Hero */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-weak px-3 py-1 font-mono text-[11px] tracking-milli text-accent-deep">
              <span className="dot dot-live" />
              DECEPTION GATEWAY · AKTIF
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
              CAKRA<span className="text-accent">·</span>DECOY
              <span className="ml-3 align-top text-xl font-medium text-ink-mute">v2.0</span>
            </h1>
            <p className="mt-3 font-mono text-xs tracking-[0.12em] text-ink-mute">
              CYBER AUTONOMOUS KERNEL-LESS ROUTING &amp; ACTIVE DECEPTION SYSTEM
            </p>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
              Pertahanan siber yang tidak memblokir musuh di depan pintu. Ia menjebak sesi
              penyerang ke ruang ilusi AI, menyadap seluruh taktiknya, memancing identitas
              aslinya keluar, lalu menyebarkan vaksin ke seluruh Kodam dalam hitungan detik.
            </p>
          </div>

          {/* Readout spesifikasi */}
          <div className="w-full max-w-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">Parameter Operasional</span>
              <span className="eyebrow">SIM</span>
            </div>
            <dl className="card divide-y divide-border">
              {SPECS.map((s) => (
                <div key={s.k} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-weak text-accent">
                    <Icon name={s.icon} className="h-4 w-4" />
                  </span>
                  <dt className="text-[13px] text-ink-soft">{s.k}</dt>
                  <dd className="ml-auto font-mono text-[13px] font-semibold text-ink">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Dua pintu masuk — asimetris (RHYTHM) */}
        <div className="mt-16 grid gap-5 lg:grid-cols-5">
          <Link
            href="/command-center"
            className="card card-accent card-raised group relative p-7 transition-shadow hover:shadow-lg lg:col-span-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white">
                  <Icon name="shield-checkered" className="h-6 w-6" />
                </span>
                <div>
                  <div className="eyebrow text-accent-deep">Layar Komando</div>
                  <h2 className="text-lg font-semibold text-ink">C4ISR Command Center</h2>
                </div>
              </div>
              <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-[10px] text-ink-mute">
                SOC PUSSIBERAD
              </span>
            </div>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
              Pantau real-time: attack graph pembelokan, peta taktis 15 Kodam, live terminal
              spy, matriks MITRE ATT&amp;CK, dan forensic ledger SHA-256.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-accent">
              Masuk pusat komando
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/target-portal"
            className="card group relative p-7 transition-shadow hover:shadow-raised lg:col-span-2"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-warn-weak text-warn">
                <Icon name="crosshair" className="h-6 w-6" />
              </span>
              <div>
                <div className="eyebrow text-warn">Layar Penyerang</div>
                <h2 className="text-lg font-semibold text-ink">Target Portal</h2>
              </div>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              Portal logistik &amp; kendali SCADA yang dilihat penyerang. Simulasikan SQLi,
              sabotase pendingin radar, dan eksplorasi Web-SSH.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-ink">
              Buka permukaan serang
              <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        {/* Pilar doktrin */}
        <div className="mt-14">
          <div className="mb-5 flex items-center gap-3">
            <span className="eyebrow">Doktrin Inti</span>
            <div className="hairline flex-1" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-weak text-accent">
                    <Icon name={p.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-sm font-semibold text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-[15px] font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 max-w-3xl text-[12.5px] leading-relaxed text-ink-mute">
          Catatan: seluruh portal &quot;asli&quot;, sabotase radar, dan broadcast 15 Kodam adalah
          simulasi terkontrol untuk demonstrasi. Tidak ada perintah sistem nyata yang
          dieksekusi. Geolokasi penyerang berakurasi tingkat kota (dari IP), bukan GPS presisi.
        </p>
      </div>
    </main>
  );
}
