import { NormalizedExternalListing } from "../apify.service";

/**
 * LACDB Actor Output Normalizer
 * Maps raw LACDB actor output to NormalizedExternalListing.
 * LACDB (Louisiana Commercial Database) format — update mappings
 * after inspecting your actual actor output.
 */
export function normalizeLacdbItem(
  raw: Record<string, unknown>
): NormalizedExternalListing {
  return {
    platform: "LACDB",
    externalId: (raw.mlsId || raw.id || raw.listingId) as string | undefined,
    listingUrl: (raw.url || raw.listingUrl) as string | undefined,
    address: (raw.address || raw.streetAddress) as string | undefined,
    city: raw.city as string | undefined,
    state: (raw.state || "LA") as string,
    zipCode: (raw.zip || raw.zipCode) as string | undefined,
    price: (raw.price || raw.listPrice) as number | undefined,
    bedrooms: raw.bedrooms as number | undefined,
    fullBaths: (raw.fullBaths || raw.bathrooms) as number | undefined,
    halfBaths: raw.halfBaths as number | undefined,
    squareFeet: (raw.squareFeet || raw.sqft || raw.buildingSize) as number | undefined,
    lotSize: raw.lotSize as string | undefined,
    propertyType: raw.propertyType as string | undefined,
    status: (raw.status || raw.listingStatus) as string | undefined,
    description: raw.description as string | undefined,
    agentName: (raw.agentName || raw.listingAgent) as string | undefined,
    rawData: raw,
  };
}
