import type { Config } from "tailwindcss";

/*
  "Layar Taktis" — arti warna tetap (konvensi kokpit militer):
    signal  = aksi / langkah aktif / sorotan (tidak pernah status)
    hostile = penyerang, ilusi, bahaya
    safe    = kondisi asli, aman, selesai
  gov-* hanya untuk portal penyerang (dunia palsu bergaya web pemerintah).
*/
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07080A",
        panel: "#0E1013",
        "panel-2": "#13161A",
        line: "#23262B",
        ink: "#F2F2F0",
        "ink-soft": "#C9CCD2",
        "ink-mute": "#8C9099",
        signal: "#FFB000",
        hostile: "#FF4D4D",
        safe: "#3DDC84",
        gov: {
          bg: "#F4F5F7",
          card: "#FFFFFF",
          ink: "#1D2330",
          soft: "#4A5363",
          brand: "#1D3A6B",
          line: "#DDE2EA",
          alarm: "#C62828",
        },
        // legacy: dihapus di task 11
        paper: "#f4f3ee",
        surface: "#ffffff",
        "surface-2": "#faf9f5",
        border: "#e7e5dc",
        "ink-faint": "#a7adb7",
        accent: "#0e7a54",
        "accent-deep": "#0a5e41",
        "accent-weak": "#e3efe8",
        "accent-line": "#bfe0cf",
        warn: "#a9741a",
        "warn-weak": "#f6ecd4",
        danger: "#b23a3a",
        "danger-weak": "#f6e1de",
        info: "#2c5e8a",
        "info-weak": "#e2ebf3",
      },
      fontFamily: {
        ui: ["var(--font-ui)", "ui-sans-serif", "system-ui", "sans-serif"],
        data: ["var(--font-data)", "ui-monospace", "Consolas", "monospace"],
        gov: ["var(--font-gov)", "ui-sans-serif", "system-ui", "sans-serif"],
        // legacy: dihapus di task 11
        mono: ["var(--font-data)", "ui-monospace", "monospace"],
        sans: ["var(--font-ui)", "ui-sans-serif", "sans-serif"],
      },
      letterSpacing: {
        milli: "0.18em",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
