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
  if (!item) {
    return NextResponse.json({ error: "Discrepancy not found" }, { status: 404 });
  }

  if (status) item.status = status;
  if (note !== undefined) item.note = note;
  if (status === "resolved") item.resolvedAt = new Date().toISOString();

  return NextResponse.json(item);
}
