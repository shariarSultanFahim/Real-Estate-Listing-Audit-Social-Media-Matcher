import { NextResponse } from "next/server";
import { MOCK_DISCREPANCIES } from "@/lib/mock-data/discrepancies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  if (listingId) {
    const filtered = MOCK_DISCREPANCIES.filter((d) => d.listingId === listingId);
    return NextResponse.json(filtered);
  }
  return NextResponse.json(MOCK_DISCREPANCIES);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status, note } = body;

  const item = MOCK_DISCREPANCIES.find((d) => d.id === id);
  const baseItem = item || MOCK_DISCREPANCIES[0];

  /*
   * NOTE: In-memory mutation (item.status = status) disabled for Vercel/serverless deployment.
   * Returning mock success response matching schema.
   */
  const updatedItem = {
    ...baseItem,
    id: id || baseItem.id,
    ...(status ? { status } : {}),
    ...(note !== undefined ? { note } : {}),
    ...(status === "resolved" ? { resolvedAt: new Date().toISOString() } : {}),
  };

  return NextResponse.json(updatedItem);
}
