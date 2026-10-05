import { config } from "../../config";
import { triggerDataset, getDatasetSnapshot, fetchViaWebUnlocker } from "./brightdata.client";
import { NormalizedExternalListing } from "../apify/apify.service";

/**
 * Normalizes Bright Data real estate dataset record into NormalizedExternalListing
 */
export function normalizeBrightDataItem(
  platform: "ZILLOW" | "REALTOR" | "LACDB",
  raw: Record<string, unknown>
): NormalizedExternalListing {
  const address = (raw.street || raw.address || raw.street_address || raw.address_street) as string | undefined;
  const city = (raw.city || raw.locality) as string | undefined;
  const state = (raw.state || raw.region) as string | undefined;
  const zipCode = (raw.zipcode || raw.zip || raw.postal_code) as string | undefined;

  let price: number | undefined;
  if (typeof raw.price === "number") price = raw.price;
  else if (typeof raw.price === "string") {
    const cleaned = raw.price.replace(/[^0-9.]/g, "");
    price = parseFloat(cleaned);
  } else if (typeof raw.unformatted_price === "number") {
    price = raw.unformatted_price;
  }

  const bedrooms = (raw.bedrooms || raw.beds || raw.num_bedrooms) as number | undefined;
  const fullBaths = (raw.bathrooms || raw.full_baths || raw.baths) as number | undefined;
  const halfBaths = (raw.half_baths || raw.half_bathrooms) as number | undefined;
  const squareFeet = (raw.living_area || raw.square_feet || raw.sqft || raw.area) as number | undefined;
  const description = (raw.description || raw.text || raw.about) as string | undefined;
  const agentName = (raw.agent_name || raw.agent || raw.broker) as string | undefined;
  const listingUrl = (raw.url || raw.link || raw.listing_url) as string | undefined;
  const externalId = (raw.id || raw.zpid || raw.property_id || raw.mls_number) ? String(raw.id || raw.zpid || raw.property_id || raw.mls_number) : undefined;

  return {
    platform,
    externalId,
    listingUrl,
    address,
    city,
    state,
    zipCode,
    price: price && price > 0 ? price : undefined,
    bedrooms,
    fullBaths,
    halfBaths,
    squareFeet,
    description,
    agentName,
    rawData: raw,
  };
}

/**
 * Scrape Zillow listing(s) using Bright Data Dataset API or Web Unlocker
 */
export async function scrapeZillowWithBrightData(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<NormalizedExternalListing[]> {
  if (!config.BRIGHTDATA_API_TOKEN) {
    console.warn("[BrightData] BRIGHTDATA_API_TOKEN not configured.");
    return [];
  }

  const datasetId = config.BRIGHTDATA_ZILLOW_DATASET_ID;
  if (datasetId) {
    try {
      const searchParam = {
        location: `${city}, ${state} ${zip}`,
        address: `${address}, ${city}, ${state} ${zip}`,
        url: `https://www.zillow.com/homes/${encodeURIComponent(`${address}, ${city}, ${state} ${zip}`)}_rb/`,
      };

      const triggerResult = await triggerDataset(datasetId, [searchParam]);
      if (triggerResult?.snapshot_id) {
        const items = await getDatasetSnapshot(triggerResult.snapshot_id);
        return items.map((item) => normalizeBrightDataItem("ZILLOW", item));
      }
    } catch (err: any) {
      console.warn(`[BrightData] Zillow dataset collection notice: ${err.message}`);
    }
  }

  return [];
}

/**
 * Scrape Realtor listing(s) using Bright Data Dataset API or Web Unlocker
 */
export async function scrapeRealtorWithBrightData(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<NormalizedExternalListing[]> {
  if (!config.BRIGHTDATA_API_TOKEN) {
    console.warn("[BrightData] BRIGHTDATA_API_TOKEN not configured.");
    return [];
  }

  const datasetId = config.BRIGHTDATA_REALTOR_DATASET_ID;
  if (datasetId) {
    try {
      const searchParam = {
        location: `${city}, ${state} ${zip}`,
        address: `${address}, ${city}, ${state} ${zip}`,
        url: `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(`${city}_${state}`)}`,
      };

      const triggerResult = await triggerDataset(datasetId, [searchParam]);
      if (triggerResult?.snapshot_id) {
        const items = await getDatasetSnapshot(triggerResult.snapshot_id);
        return items.map((item) => normalizeBrightDataItem("REALTOR", item));
      }
    } catch (err: any) {
      console.warn(`[BrightData] Realtor dataset collection notice: ${err.message}`);
    }
  }

  return [];
}
