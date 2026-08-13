import { NextResponse } from "next/server";
import { MOCK_AGENTS } from "@/lib/mock-data/agents";

export async function GET() {
  return NextResponse.json(MOCK_AGENTS);
}

export async function POST(request: Request) {
  const body = await request.json();

  /*
   * NOTE: In-memory mutation (MOCK_AGENTS.unshift) disabled for Vercel/serverless deployment.
   * Returning mock success response matching schema.
   */
  const newAgent = {
    ...body,
    id: `agent-${Date.now()}`,
  };

  return NextResponse.json(newAgent, { status: 201 });
}
