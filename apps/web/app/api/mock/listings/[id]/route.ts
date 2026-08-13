import { NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/mock-data/listings";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = MOCK_LISTINGS.find((l) => l.id === id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  return NextResponse.json(listing);
}
