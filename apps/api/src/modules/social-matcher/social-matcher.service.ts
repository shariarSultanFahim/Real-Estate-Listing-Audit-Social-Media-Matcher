import { prisma } from "../../prisma";
import { MatchResult } from "@real-estate/types";

export interface MatchQuery {
  city: string;
  state?: string;
  price: number;
}

/**
 * Matches agents to a listing query based on:
 * 1. Service area contains the city (case-insensitive)
 * 2. Cross-post preference:
 *    - "all"          → always match
 *    - "areaAndPrice" → match if price is within priceRangeMin..priceRangeMax
 *    - "byRequest"    → include but flag
 *    - "never"        → exclude
 */
export async function matchAgents(query: MatchQuery): Promise<MatchResult[]> {
  const allAgents = await prisma.agent.findMany({
    where: {
      // Exclude agents who never cross-post
      crossPostPreference: { not: "never" },
    },
  });

  const normalizedCity = query.city.toLowerCase().trim();

  const results: MatchResult[] = [];

  for (const agent of allAgents) {
    // Check service area match
    const servesArea = agent.serviceAreas.some(
      (area) => area.toLowerCase().includes(normalizedCity) || normalizedCity.includes(area.toLowerCase())
    );

    if (!servesArea) continue;

    // Check price range
    const pref = agent.crossPostPreference;

    if (pref === "areaAndPrice") {
      const min = agent.priceRangeMin ? Number(agent.priceRangeMin) : null;
      const max = agent.priceRangeMax ? Number(agent.priceRangeMax) : null;
      const withinRange =
        (min === null || query.price >= min) &&
        (max === null || query.price <= max);
      if (!withinRange) continue;
    }

    // Build match reason
    let matchReason = `Serves ${query.city}`;
    if (pref === "all") matchReason += " · Cross-posts all listings";
    if (pref === "areaAndPrice") matchReason += " · Price within preferred range";
    if (pref === "byRequest") matchReason += " · Cross-posts by request";

    results.push({
      agentId: agent.id,
      agentName: agent.name,
      facebookPageUrl: agent.facebookPageUrl ?? undefined,
      instagramPageUrl: agent.instagramPageUrl ?? undefined,
      matchReason,
      locationRegion: agent.serviceAreas.join(", "),
      pricePreference:
        agent.priceRangeMin && agent.priceRangeMax
          ? `$${Number(agent.priceRangeMin).toLocaleString()} – $${Number(agent.priceRangeMax).toLocaleString()}`
          : "No range set",
      sharingPreference: pref,
    });
  }

  return results;
}
