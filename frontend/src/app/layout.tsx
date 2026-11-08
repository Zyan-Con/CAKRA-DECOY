import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAKRA-DECOY 2.0 · Active Deception Gateway",
  description:
    "PUSSIBERAD // Kartika Cyber Hackathon 2026 · Opaque Silent Tactical Interceptor & AI Mirror-Twin Deception System untuk infrastruktur IT/OT TNI AD.",
};

export const viewport: Viewport = {
  themeColor: "#f4f3ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
