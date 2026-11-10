import type { Metadata } from "next";
import type { ReactNode } from "react";

// Judul tab netral: portal jebakan tidak boleh membocorkan kata "decoy"/"deception".
export const metadata: Metadata = {
  title: "Portal Logistik & Kendali SCADA Kodam",
  description: "Sistem Pertahanan Logistik Terpadu",
};

export default function TargetPortalLayout({ children }: { children: ReactNode }) {
  return children;
}
