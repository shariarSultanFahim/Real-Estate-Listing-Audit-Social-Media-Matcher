import { NextResponse } from "next/server";
import { MOCK_AGENTS } from "@/lib/mock-data/agents";

export async function GET() {
  return NextResponse.json(MOCK_AGENTS);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newAgent = {
    ...body,
    id: `agent-${Date.now()}`,
  };
  MOCK_AGENTS.unshift(newAgent);
  return NextResponse.json(newAgent, { status: 201 });
}
