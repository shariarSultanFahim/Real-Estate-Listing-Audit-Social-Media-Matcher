import { Agent as PrismaAgent } from "@prisma/client";
import { Agent } from "@real-estate/types";

export function mapAgent(row: PrismaAgent): Agent {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    officeState: row.officeState as Agent["officeState"],
    serviceAreas: row.serviceAreas,
    facebookPageUrl: row.facebookPageUrl ?? undefined,
    instagramPageUrl: row.instagramPageUrl ?? undefined,
    crossPostPreference: row.crossPostPreference as Agent["crossPostPreference"],
    priceRangeMin: row.priceRangeMin ? Number(row.priceRangeMin) : undefined,
    priceRangeMax: row.priceRangeMax ? Number(row.priceRangeMax) : undefined,
  };
}

export function mapAgents(rows: PrismaAgent[]): Agent[] {
  return rows.map(mapAgent);
}
