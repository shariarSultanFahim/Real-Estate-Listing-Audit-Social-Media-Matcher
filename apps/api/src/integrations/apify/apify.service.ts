import { config } from "../../config";
import { runActor, getDatasetItems, waitForRun } from "./apify.client";
import { normalizeZillowItem } from "./actors/zillow.actor";
import { normalizeRealtorItem } from "./actors/realtor.actor";
import { normalizeLacdbItem } from "./actors/lacdb.actor";

export type Platform = "ZILLOW" | "REALTOR" | "LACDB";

export interface NormalizedExternalListing {
  platform: Platform;
  externalId?: string;
  listingUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  bedrooms?: number;
  fullBaths?: number;
  halfBaths?: number;
  squareFeet?: number;
  lotSize?: string;
  propertyType?: string;
  status?: string;
  description?: string;
  agentName?: string;
  rawData: Record<string, unknown>;
}

/**
 * Scrape a single listing from Zillow by address.
 * Returns normalized ExternalListing or null if actor not configured.
 */
export async function scrapeZillow(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<NormalizedExternalListing[]> {
  if (!config.APIFY_ZILLOW_ACTOR_ID) {
    console.warn("[Apify] APIFY_ZILLOW_ACTOR_ID not set.");
    return [];
  }

  const searchQuery = encodeURIComponent(
    JSON.stringify({
      pagination: {},
      usersSearchTerm: `${address}, ${city}, ${state} ${zip}`.trim(),
      filterState: {
        sortSelection: { value: "globalrelevanceex" },
      },
    })
  );
  const searchUrl = `https://www.zillow.com/homes/${encodeURIComponent(`${city}-${state}`)}/?searchQueryState=${searchQuery}`;

  const run = await runActor(config.APIFY_ZILLOW_ACTOR_ID, {
    searchUrls: [{ url: searchUrl }],
    maxItems: 5,
  });

  if (!run) return [];

  const completed = await waitForRun(run.runId);
  if (!completed || completed.status !== "SUCCEEDED") return [];

  const items = await getDatasetItems<Record<string, unknown>>(
    completed.defaultDatasetId
  );

  return items.filter((it) => !it.error).map(normalizeZillowItem);
}

/**
 * Scrape a single listing from Realtor.com by address.
 */
export async function scrapeRealtor(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<NormalizedExternalListing[]> {
  if (!config.APIFY_REALTOR_ACTOR_ID) {
    console.warn("[Apify] APIFY_REALTOR_ACTOR_ID not set.");
    return [];
  }

  const run = await runActor(config.APIFY_REALTOR_ACTOR_ID, {
    location: `${address}, ${city}, ${state} ${zip}`.trim(),
    zipCodes: zip ? [zip] : undefined,
    maxResults: 10,
  });

  if (!run) return [];

  const completed = await waitForRun(run.runId);
  if (!completed || completed.status !== "SUCCEEDED") return [];

  const items = await getDatasetItems<Record<string, unknown>>(
    completed.defaultDatasetId
  );

  return items.map(normalizeRealtorItem);
}

/**
 * Scrape LACDB listings by MLS number.
 */
export async function scrapeLacdb(
  mlsNumber: string
): Promise<NormalizedExternalListing[]> {
  if (!config.APIFY_LACDB_ACTOR_ID) {
    console.warn("[Apify] APIFY_LACDB_ACTOR_ID not set.");
    return [];
  }

  const run = await runActor(config.APIFY_LACDB_ACTOR_ID, {
    mlsNumber,
    maxResults: 3,
  });

  if (!run) return [];

  const completed = await waitForRun(run.runId);
  if (!completed || completed.status !== "SUCCEEDED") return [];

  const items = await getDatasetItems<Record<string, unknown>>(
    completed.defaultDatasetId
  );

  return items.map(normalizeLacdbItem);
}
