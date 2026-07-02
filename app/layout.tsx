import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokyoStay Property CMS",
  description: "A lightweight property presentation and publishing system for TokyoStay."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
