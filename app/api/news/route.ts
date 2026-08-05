import { NextResponse } from "next/server";
import { fetchRelevantNews } from "@/lib/news/aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchRelevantNews();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
