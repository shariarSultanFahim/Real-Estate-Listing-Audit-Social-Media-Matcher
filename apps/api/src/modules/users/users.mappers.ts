import { User as PrismaUser } from "@prisma/client";
import { User } from "@real-estate/types";

// NEVER return passwordHash to the frontend
export function mapUser(row: PrismaUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    accountType: row.accountType as User["accountType"],
    permissions: row.permissions as User["permissions"],
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? undefined,
  };
}

export function mapUsers(rows: PrismaUser[]): User[] {
  return rows.map(mapUser);
}
