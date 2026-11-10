/**
 * Ikon Solar Bold Duotone dari subset lokal (src/lib/solar-icons.json, dibuat `npm run icons`).
 * Render inline SVG di server: offline, tanpa flash ikon kosong, warna mewarisi `currentColor`.
 * Lisensi Solar Icons: CC BY 4.0 (kredit di footer landing).
 */
import solarIcons from "@/lib/solar-icons.json";

export type IconName = keyof typeof solarIcons.icons;

interface IconData {
  body: string;
  width?: number;
  height?: number;
}

export interface IconProps {
  name: IconName;
  className?: string;
  title?: string;
}

export function Icon({ name, className, title }: IconProps) {
  const data: IconData = solarIcons.icons[name];
  const w = data.width ?? solarIcons.width;
  const h = data.height ?? solarIcons.height;
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
