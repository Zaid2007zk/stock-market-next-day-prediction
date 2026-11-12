import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeX Pro — High-Performance Trading & Intelligence Terminal",
  description: "Institutional-grade trading terminal, real-time DMA broker execution, factor intelligence, and quantitative research for Indian & US markets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
