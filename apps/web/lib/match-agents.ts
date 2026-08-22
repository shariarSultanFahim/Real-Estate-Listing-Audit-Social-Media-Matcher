import { Agent, MatchResult } from "@real-estate/types";

export function matchAgentsForListing(
  city: string,
  price: number,
  agents: Agent[]
): MatchResult[] {
  const normalizedCity = city.trim().toLowerCase();
  const results: MatchResult[] = [];

  for (const agent of agents) {
    if (agent.crossPostPreference === "never") {
      continue;
    }

    if (agent.crossPostPreference === "all") {
      results.push({
        agentId: agent.id,
        agentName: agent.name,
        facebookPageUrl: agent.facebookPageUrl,
        instagramPageUrl: agent.instagramPageUrl,
        matchReason: "Agent prefers all new listings cross-posted automatically.",
        locationRegion: `${agent.officeState} (${agent.serviceAreas.join(", ")})`,
        pricePreference: "Any Price / All Ranges",
        sharingPreference: "Always Share (All Listings)",
      });
      continue;
    }

    if (agent.crossPostPreference === "areaAndPrice") {
      const coversArea = agent.serviceAreas.some(
        (area) => area.toLowerCase() === normalizedCity
      );
      const min = agent.priceRangeMin ?? 0;
      const max = agent.priceRangeMax ?? Infinity;

      if (coversArea && price >= min && price <= max) {
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          facebookPageUrl: agent.facebookPageUrl,
          instagramPageUrl: agent.instagramPageUrl,
          matchReason: `Covers ${city} area within price range $${min.toLocaleString()} – $${max.toLocaleString()}`,
          locationRegion: `${agent.officeState} (${agent.serviceAreas.join(", ")})`,
          pricePreference: `$${min.toLocaleString()} – $${max === Infinity ? "No Max" : max.toLocaleString()}`,
          sharingPreference: "Area & Price Dependent",
        });
      }
    }

    // preference === 'byRequest' requires manual sign-off per spec and is excluded from auto-matching
  }

  return results;
}
