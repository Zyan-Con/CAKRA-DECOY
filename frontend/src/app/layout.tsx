import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAKRA-DECOY 2.0 — Cyber Autonomous Deception Gateway",
  description:
    "PUSSIBERAD // Kartika Cyber Hackathon 2026 — Opaque Silent Tactical Interceptor & AI Mirror-Twin Deception System.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className="bg-slate-950">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
