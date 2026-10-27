import { prisma } from "../../prisma";
import { createError } from "../../middleware/errorHandler";
import { mapAgent, mapAgents } from "./agents.mappers";
import { Agent } from "@real-estate/types";
import { Prisma } from "@prisma/client";

export async function findAll(): Promise<Agent[]> {
  const rows = await prisma.agent.findMany({
    orderBy: { name: "asc" },
  });
  return mapAgents(rows);
}

export async function findById(id: string): Promise<Agent> {
  const row = await prisma.agent.findUnique({ where: { id } });
  if (!row) throw createError(`Agent ${id} not found`, 404);
  return mapAgent(row);
}

export interface CreateAgentInput {
  name: string;
  email: string;
  phone?: string;
  officeState: "LA" | "MS" | "AL";
  serviceAreas: string[];
  facebookPageUrl?: string;
  instagramPageUrl?: string;
  crossPostPreference: "all" | "byRequest" | "never" | "areaAndPrice";
  priceRangeMin?: number;
  priceRangeMax?: number;
  bio?: string;
  licenseNumber?: string;
}

export async function create(input: CreateAgentInput): Promise<Agent> {
  const exists = await prisma.agent.findUnique({ where: { email: input.email } });
  if (exists) throw createError(`Agent with email ${input.email} already exists`, 409);

  const row = await prisma.agent.create({
    data: {
      ...input,
      priceRangeMin: input.priceRangeMin != null ? new Prisma.Decimal(input.priceRangeMin) : undefined,
      priceRangeMax: input.priceRangeMax != null ? new Prisma.Decimal(input.priceRangeMax) : undefined,
    },
  });
  return mapAgent(row);
}

export async function update(
  id: string,
  input: Partial<CreateAgentInput>
): Promise<Agent> {
  const existing = await prisma.agent.findUnique({ where: { id } });
  if (!existing) throw createError(`Agent ${id} not found`, 404);

  const row = await prisma.agent.update({
    where: { id },
    data: {
      ...input,
      priceRangeMin: input.priceRangeMin != null ? new Prisma.Decimal(input.priceRangeMin) : undefined,
      priceRangeMax: input.priceRangeMax != null ? new Prisma.Decimal(input.priceRangeMax) : undefined,
    },
  });
  return mapAgent(row);
}

export async function remove(id: string): Promise<{ success: boolean; message: string }> {
  const existing = await prisma.agent.findUnique({
    where: { id },
    include: { listings: { select: { id: true, mlsNumber: true } } },
  });
  if (!existing) throw createError(`Agent ${id} not found`, 404);

  if (existing.listings.length > 0) {
    throw createError(
      `Cannot delete agent "${existing.name}" because they are currently assigned to ${existing.listings.length} active listing(s) (${existing.listings.map((l) => l.mlsNumber).slice(0, 3).join(", ")}). Please reassign their listing(s) to another agent first.`,
      400
    );
  }

  await prisma.agent.delete({ where: { id } });
  return { success: true, message: `Agent ${existing.name} deleted successfully.` };
}

