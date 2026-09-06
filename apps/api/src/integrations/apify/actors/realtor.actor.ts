import { NormalizedExternalListing } from "../apify.service";

/**
 * Realtor.com Actor Output Normalizer
 * Maps raw Apify Realtor actor output to NormalizedExternalListing.
 * Handles both flat output (from 8OiawGp73IqEh7I8h) and nested GraphQL schemas.
 */
export function normalizeRealtorItem(
  raw: Record<string, unknown>
): NormalizedExternalListing {
  const location = raw.location as Record<string, unknown> | undefined;
  const locAddress = location?.address as Record<string, unknown> | undefined;

  const address =
    (raw.address as string) ||
    (locAddress?.line as string) ||
    (raw.streetAddress as string);

  const city = (raw.city as string) || (locAddress?.city as string);
  const state =
    (raw.stateCode as string) ||
    (raw.state as string) ||
    (locAddress?.state_code as string);

  const zipCode =
    (raw.postalCode as string) ||
    (raw.zip as string) ||
    (locAddress?.postal_code as string);

  const priceRaw =
    (raw.listPrice as number) ||
    (raw.list_price as number) ||
    (raw.price as number);

  const description = raw.description as Record<string, unknown> | string | undefined;
  const descText = typeof description === "string" ? description : (description?.text as string);

  const agentData = raw.advertisers as Array<Record<string, unknown>> | undefined;
  const agentName =
    (raw.agentName as string) ||
    (agentData?.[0]?.name as string) ||
    ((raw.brandName as string) ? `Brokerage: ${raw.brandName}` : undefined);

  const beds = (raw.beds || (description as any)?.beds) as number | undefined;
  const fullBaths = (raw.bathsFull || raw.baths_full || raw.baths || (description as any)?.baths_full) as number | undefined;
  const halfBaths = (raw.bathsHalf || raw.baths_half || (description as any)?.baths_half) as number | undefined;
  const sqft = (raw.sqft || (description as any)?.sqft) as number | undefined;

  const externalId = (raw.propertyId || raw.listingId || raw.property_id || raw.id) as string | undefined;
  const listingUrl = (raw.propertyUrl || raw.permalink || raw.url) as string | undefined;

  return {
    platform: "REALTOR",
    externalId: externalId ? String(externalId) : undefined,
    listingUrl,
    address,
    city,
    state,
    zipCode,
    price: priceRaw || undefined,
    bedrooms: beds,
    fullBaths: fullBaths ? Math.floor(fullBaths) : undefined,
    halfBaths: halfBaths ? Math.floor(halfBaths) : undefined,
    squareFeet: sqft,
    lotSize: (raw.lotSqft || (description as any)?.lot_sqft)?.toString(),
    propertyType: (raw.propertyType || raw.propertySubType || (description as any)?.type) as string | undefined,
    status: (raw.status as string) || "for_sale",
    description: descText,
    agentName,
    rawData: raw,
  };
}
