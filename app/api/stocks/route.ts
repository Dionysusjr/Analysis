import { NextResponse } from "next/server";
import { fetchStockQuotes } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchStockQuotes();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
