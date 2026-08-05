import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JA Dividend Watch — Live Jamaican Dividend Stock Dashboard",
  description:
    "Live-updating dashboard for Jamaican dividend-paying stocks: prices, OHLC, dividend yields, and a related news & sentiment feed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b1220] text-gray-100 antialiased">{children}</body>
    </html>
  );
}
