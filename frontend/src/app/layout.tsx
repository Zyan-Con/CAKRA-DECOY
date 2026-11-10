import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

// next/font meng-host font sendiri saat build: tidak ada request ke Google saat runtime.
const ui = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-ui",
});
const data = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-data",
});
const gov = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gov",
});

export const metadata: Metadata = {
  title: "CAKRA-DECOY 2.0 · Active Deception Gateway",
  description:
    "Penyerang mengira dia menang, padahal dia sedang dijebak dan ditonton. Sistem deception aktif untuk infrastruktur IT/OT TNI AD · Kartika Cyber Hackathon 2026.",
};

export const viewport: Viewport = {
  themeColor: "#07080A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${ui.variable} ${data.variable} ${gov.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
