import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capitol Ledger — US political trading disclosures",
  description:
    "Live dashboard of stocks, ETFs, bonds, funds, options and crypto disclosed by US politicians and executive-branch officials, with per-filer profiles, per-asset history and portfolio-size rankings.",
};

export default function CongressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
