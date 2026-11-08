/**
 * Icon · render inline SVG langsung dari data Phosphor lokal (src/lib/ph-icons.json,
 * subset 77 ikon ~38KB).
 *
 * Alasan desain:
 * - 100% offline (tanpa fetch API Iconify) → wajib untuk mode air-gapped satuan.
 * - Render identik di server (SSR) & client → tidak ada "flash" ikon kosong dan
 *   tidak ada hydration mismatch (komponen runtime Iconify menunda render ke client).
 * - Bukan Lucide. Phosphor dipilih karena geometri tegas/engineered yang cocok untuk
 *   konsol taktis C4ISR, dan bukan set ikon default AI.
 *
 * Komponen ini pure (server component) · `fill: currentColor` mewarisi warna teks,
 * jadi utilitas Tailwind seperti `text-signal` langsung bekerja; ukuran via `h-/w-`.
 */

import icons from "./ph-icons.json";

interface IconData {
  body: string;
  width?: number;
  height?: number;
}

const SET = icons as unknown as {
  icons: Record<string, IconData>;
  width?: number;
  height?: number;
};

const DEFAULT_W = SET.width ?? 256;
const DEFAULT_H = SET.height ?? 256;

export interface IconProps {
  name: string; // nama Phosphor tanpa prefix, mis. "shield-checkered"
  className?: string;
  title?: string;
}

export function Icon({ name, className, title }: IconProps) {
  const data = SET.icons[name];
  if (!data) {
    if (process.env.NODE_ENV !== "production") {
      // Bantu ketahuan saat nama ikon salah ketik.
      console.warn(`[Icon] ikon Phosphor "${name}" tidak ada di subset ph-icons.json`);
    }
    return null;
  }
  const w = data.width ?? DEFAULT_W;
  const h = data.height ?? DEFAULT_H;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      width="1em"
      height="1em"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
}
