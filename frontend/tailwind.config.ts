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
      },
      fontFamily: {
        ui: ["var(--font-ui)", "ui-sans-serif", "system-ui", "sans-serif"],
        data: ["var(--font-data)", "ui-monospace", "Consolas", "monospace"],
        gov: ["var(--font-gov)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
