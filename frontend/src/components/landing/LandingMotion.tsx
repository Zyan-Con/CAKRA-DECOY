"use client";

/**
 * Gerak landing yang sengaja minimal: hanya dua elemen kunci yang bergerak.
 * 1) Hero masuk bertahap saat halaman dibuka. 2) Daftar langkah muncul saat di-scroll.
 * Hanya transform + opacity (tanpa reflow); LazyMotion + m menjaga bundle kecil; MotionConfig "user" mematikan transform
 * bila pengguna memilih prefers-reduced-motion, sehingga yang tersisa hanya fade.
 */
import Link from "next/link";
import { LazyMotion, MotionConfig, domAnimation, m, stagger, type Variants } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { STEPS } from "@/lib/attack-steps";

/** Melambat saat tiba (deceleration) — satu kurva untuk semua gerak masuk di landing. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.05) } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function LandingHero() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
      <m.div variants={container} initial="hidden" animate="show">
        <m.p variants={rise} className="text-sm font-semibold text-signal">
          CAKRA-DECOY 2.0 · Active Deception Gateway
        </m.p>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          <m.span variants={rise} className="block">
            Penyerang mengira menang.
          </m.span>
          <m.span variants={rise} className="block text-signal">
            Padahal dijebak.
          </m.span>
        </h1>
        <m.p
          variants={rise}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft"
        >
          CAKRA-DECOY tidak memblokir penyerang di depan pintu. Ia membelokkan
          penyerang ke portal tiruan, menyadap setiap langkahnya, membongkar
          identitasnya, lalu menyebarkan vaksin ke seluruh Kodam.
        </m.p>
        <m.div
          variants={rise}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <m.span
            className="inline-flex"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              href="/demo"
              className="group inline-flex min-h-[52px] items-center gap-2 rounded-sm bg-signal px-6 text-base font-bold text-bg"
            >
              <Icon name="play-bold-duotone" className="h-5 w-5" />
              Mulai demo terpandu
              <Icon
                name="arrow-right-bold-duotone"
                className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </m.span>
          <p className="text-sm text-ink-mute">
            5 langkah, sekitar 2 menit. Setiap tombol menjalankan serangan
            sungguhan ke sistem.
          </p>
        </m.div>
      </m.div>
    </MotionConfig>
      </LazyMotion>
  );
}

const row: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

export function LandingSteps() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
      <m.ol
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="mt-16 max-w-3xl divide-y divide-line border-y border-line"
      >
        {STEPS.map((s, i) => (
          <m.li
            key={s.id}
            variants={row}
            className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 transition-colors duration-200 hover:bg-panel"
          >
            <span className="w-6 shrink-0 font-data text-sm text-ink-mute transition-colors duration-200 group-hover:text-signal">
              {i + 1}
            </span>
            <span className="flex-1 text-base font-semibold text-ink transition-transform duration-200 group-hover:translate-x-1">
              {s.title}
            </span>
            <span className="text-sm text-ink-mute">{s.technical}</span>
          </m.li>
        ))}
      </m.ol>
    </MotionConfig>
      </LazyMotion>
  );
}
