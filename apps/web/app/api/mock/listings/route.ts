import { NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/mock-data/listings";

export async function GET() {
  return NextResponse.json(MOCK_LISTINGS);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newListing = {
    ...body,
    id: `list-${Date.now()}`,
    lastUpdatedAt: new Date().toISOString(),
  };
  MOCK_LISTINGS.unshift(newListing);
  return NextResponse.json(newListing, { status: 201 });
}
