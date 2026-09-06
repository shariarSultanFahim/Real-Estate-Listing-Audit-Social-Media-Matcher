import bcrypt from "bcryptjs";
import { prisma } from "../../prisma";
import { createError } from "../../middleware/errorHandler";
import { mapUser, mapUsers } from "./users.mappers";
import { User } from "@real-estate/types";

const SALT_ROUNDS = 12;

export async function findAll(): Promise<User[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });
  return mapUsers(rows);
}

export async function findById(id: string): Promise<User> {
  const row = await prisma.user.findUnique({ where: { id } });
  if (!row) throw createError(`User ${id} not found`, 404);
  return mapUser(row);
}

export async function findByEmail(email: string): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { email } });
  return row ? mapUser(row) : null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  accountType?: "superAdmin" | "employee";
  permissions?: string[];
}

export async function create(input: CreateUserInput): Promise<User> {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw createError(`User with email ${input.email} already exists`, 409);

  const passwordHash = await bcrypt.hash(
    input.password ?? "ChangeMe123!",
    SALT_ROUNDS
  );

  const row = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      accountType: input.accountType ?? "employee",
      permissions: input.permissions ?? [],
    },
  });

  return mapUser(row);
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  accountType?: "superAdmin" | "employee";
  permissions?: string[];
}

export async function update(id: string, input: UpdateUserInput): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw createError(`User ${id} not found`, 404);

  const passwordHash = input.password
    ? await bcrypt.hash(input.password, SALT_ROUNDS)
    : undefined;

  const row = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.accountType ? { accountType: input.accountType } : {}),
      ...(input.permissions ? { permissions: input.permissions } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  return mapUser(row);
}

// Called by auth flow to verify password and record login timestamp
export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { email } });
  if (!row) return null;

  const valid = await bcrypt.compare(password, row.passwordHash);
  if (!valid) return null;

  // Record last login
  const updated = await prisma.user.update({
    where: { id: row.id },
    data: { lastLoginAt: new Date() },
  });

  return mapUser(updated);
}
