import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/congress/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getSnapshot();
    return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to build snapshot: ${message}` },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
