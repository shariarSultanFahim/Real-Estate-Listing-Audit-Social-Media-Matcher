import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-data/users";

export async function GET() {
  return NextResponse.json(MOCK_USERS);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newUser = {
    ...body,
    id: `usr-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  /*
   * NOTE: In-memory mutation disabled for Vercel deployment.
   * Return created mock user object matching UserSchema.
   */
  return NextResponse.json(newUser, { status: 201 });
}
