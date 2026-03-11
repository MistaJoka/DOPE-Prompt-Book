import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { PROMPTBOOK_CANONICAL_URL } from "@/lib/prompt-runtime";

import "./globals.css";

const title = "DOPE Prompt Book";
const description =
  "A local-first prompt library and composer for assembling reusable prompt workflows.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(PROMPTBOOK_CANONICAL_URL),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title,
    description,
    url: PROMPTBOOK_CANONICAL_URL,
    siteName: title,
    type: "website"
  },
  twitter: {
    card: "summary",
    title,
    description
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
