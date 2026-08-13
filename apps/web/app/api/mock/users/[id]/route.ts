import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-data/users";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = MOCK_USERS.find((u) => u.id === id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const existing = MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[0];

  const updatedUser = {
    ...existing,
    ...body,
    id: id || existing.id,
  };

  return NextResponse.json(updatedUser);
}
