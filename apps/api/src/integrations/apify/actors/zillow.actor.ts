import { NormalizedExternalListing } from "../apify.service";

/**
 * Zillow Actor Output Normalizer
 * Maps raw Apify Zillow actor output to NormalizedExternalListing.
 * Robustly parses both shallow/search result schemas and deep detail property objects.
 */
export function normalizeZillowItem(
  raw: Record<string, unknown>
): NormalizedExternalListing {
  // Address parsing
  const listingAddress = raw.listingAddress as Record<string, unknown> | undefined;
  const addressObj = typeof raw.address === "object" && raw.address !== null
    ? (raw.address as Record<string, unknown>)
    : undefined;

  const address =
    (listingAddress?.street as string) ||
    (addressObj?.street as string) ||
    (raw.streetAddress as string) ||
    (typeof raw.address === "string" ? raw.address : undefined);

  const city =
    (listingAddress?.city as string) ||
    (addressObj?.city as string) ||
    (raw.city as string);

  const state =
    (listingAddress?.state as string) ||
    (addressObj?.state as string) ||
    (raw.state as string);

  const zipcode =
    (listingAddress?.zipCode as string) ||
    (addressObj?.zipCode as string) ||
    (raw.zipcode as string) ||
    (raw.zip as string) ||
    (raw.postalCode as string);

  // Price parsing
  const listingPrice = raw.listingPrice as Record<string, unknown> | undefined;
  const hdpData = raw.hdpData as Record<string, unknown> | undefined;
  const homeInfo = hdpData?.homeInfo as Record<string, unknown> | undefined;

  const price =
    (listingPrice?.amount as number) ||
    (raw.price as number) ||
    (raw.unformattedPrice as number) ||
    (homeInfo?.price as number) ||
    (raw.lastSoldPrice as number);

  // Beds & Baths parsing
  const bathroomsDetail = raw.bathroomsDetail as Record<string, unknown> | undefined;
  const beds = (raw.bedrooms || raw.beds) as number | undefined;
  const fullBaths =
    (bathroomsDetail?.full as number) ||
    (raw.bathrooms as number) ||
    (raw.baths as number);
  const halfBaths =
    (bathroomsDetail?.half as number) ||
    (raw.halfBaths as number) ||
    (fullBaths && fullBaths % 1 >= 0.5 ? 1 : 0);

  // Area & Dimensions
  const sqft =
    (raw.livingArea as number) ||
    (raw.area as number) ||
    (raw.sqft as number);

  const lotArea = raw.lotArea as Record<string, unknown> | undefined;
  const lotSize =
    (lotArea?.value != null ? `${lotArea.value} ${lotArea.unit || "sqft"}` : undefined) ||
    (raw.lotSize as string);

  // Description
  const description =
    (raw.description as string) ||
    (homeInfo?.description as string);

  // Coordinates
  const coordinates = raw.coordinates as Record<string, unknown> | undefined;
  const lat = coordinates?.latitude as number | undefined;
  const lng = coordinates?.longitude as number | undefined;

  // IDs & URLs
  const zpid = raw.zpid || raw.id;
  const detailUrl =
    (raw.propertyUrl as string) ||
    (raw.detailUrl as string) ||
    (raw.url as string) ||
    (raw.listingUrl as string);

  // Agent / Broker
  const agentObj = raw.agent as Record<string, unknown> | undefined;
  const brokerObj = raw.broker as Record<string, unknown> | undefined;
  const agentName =
    (agentObj?.name as string) ||
    (raw.agentName as string) ||
    (raw.brokerName as string) ||
    (brokerObj?.name as string);

  const status = (raw.listingStatus || raw.homeStatus || raw.status || raw.homeType) as string | undefined;
  const propertyType = (raw.homeType || raw.propertyType) as string | undefined;

  return {
    platform: "ZILLOW",
    externalId: zpid ? String(zpid) : undefined,
    listingUrl: detailUrl,
    address,
    city,
    state,
    zipCode: zipcode,
    price: price && price > 0 ? price : undefined,
    bedrooms: beds,
    fullBaths: fullBaths ? Math.floor(fullBaths) : undefined,
    halfBaths: halfBaths ? Math.floor(halfBaths) : undefined,
    squareFeet: sqft,
    lotSize,
    propertyType,
    status,
    description,
    agentName,
    rawData: {
      ...raw,
      lat,
      lng,
    },
  };
}
