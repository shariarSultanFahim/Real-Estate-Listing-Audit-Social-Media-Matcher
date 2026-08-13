import { NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/mock-data/listings";

export async function GET() {
  return NextResponse.json(MOCK_LISTINGS);
}

export async function POST(request: Request) {
  const body = await request.json();

  /*
   * NOTE: In-memory mutation (MOCK_LISTINGS.unshift) disabled for Vercel/serverless deployment.
   * Returning mock success response matching schema.
   */
  const newListing = {
    ...body,
    id: `list-${Date.now()}`,
    lastUpdatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newListing, { status: 201 });
}
