import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAKRA-DECOY 2.0 · Active Deception Gateway",
  description:
    "Penyerang mengira menang. Padahal dijebak. Sistem deception aktif untuk infrastruktur IT/OT TNI AD · Kartika Cyber Hackathon 2026.",
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
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
