import type { Config } from "tailwindcss";

/*
  Palet terang 70 / 20 / 10 (R-29):
    netral dominan (paper/surface) · ink navy sekunder · emerald aksen.
  Fungsional (warn/danger/info) dibatasi untuk titik data kecil.
*/
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f3ee",
        surface: "#ffffff",
        "surface-2": "#faf9f5",
        border: "#e7e5dc",
        "border-strong": "#d7d4c7",
        ink: "#18283c",
        "ink-soft": "#3c495b",
        "ink-mute": "#78818f",
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
        mono: [
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "JetBrains Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        sans: [
          "IBM Plex Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        "4.5": "1.125rem",
      },
      letterSpacing: {
        milli: "0.18em",
      },
      borderRadius: {
        xl: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(24,40,60,0.05)",
        raised: "0 6px 20px -10px rgba(24,40,60,0.18)",
        lg: "0 20px 44px -22px rgba(24,40,60,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
