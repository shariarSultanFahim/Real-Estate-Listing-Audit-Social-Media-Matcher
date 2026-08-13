import { NextResponse } from "next/server";
import { MOCK_AGENTS } from "@/lib/mock-data/agents";
import { matchAgentsForListing } from "@/lib/match-agents";

export async function POST(request: Request) {
  const body = await request.json();
  const { city, price } = body;

  if (!city || typeof price !== "number") {
    return NextResponse.json({ error: "Invalid query payload" }, { status: 400 });
  }

  const results = matchAgentsForListing(city, price, MOCK_AGENTS);
  return NextResponse.json(results);
}
