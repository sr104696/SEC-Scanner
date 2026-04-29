import { NextResponse } from "next/server";
import { extractFinancials, SecError } from "@/server-lib/sec/sec-financials";

export const runtime = "nodejs";
// SEC company-facts JSON can be sizeable; allow generous time on cold fetch.
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as { ticker?: unknown; startYear?: unknown; endYear?: unknown };
  const ticker = String(b.ticker ?? "").trim();
  const currentYear = new Date().getFullYear();
  const startYear = Number(b.startYear ?? currentYear - 5);
  const endYear = Number(b.endYear ?? currentYear);

  try {
    const result = await extractFinancials({ ticker, startYear, endYear });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SecError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[sec-financials] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
