import "dotenv/config";
import { getApifyClient } from "../src/integrations/apify/apify.client";
import { findAll } from "../src/modules/listings/listings.service";
import { computeMatchConfidence } from "../src/services/matching.service";
import { normalizeZillowItem } from "../src/integrations/apify/actors/zillow.actor";
import { normalizeRealtorItem } from "../src/integrations/apify/actors/realtor.actor";

async function fetchAllApifyData() {
  const client = getApifyClient();
  if (!client) {
    console.error("Apify client not initialized");
    return;
  }

  const listings = await findAll();
  console.log(`Loaded ${listings.length} Source of Truth MLS listings.`);

  console.log("\n📦 Fetching all recent runs from Apify account...");
  const runs = await client.runs().list({ limit: 50, desc: true });
  console.log(`Found ${runs.items.length} total runs in Apify account:`);

  let totalItemsFetched = 0;
  const allScrapedItems: any[] = [];

  for (const run of runs.items) {
    console.log(`\n--- Run ${run.id} (Actor: ${run.actId}, Status: ${run.status}, Created: ${run.startedAt}) ---`);
    if (run.defaultDatasetId) {
      // Fetch all items with pagination / high limit
      let offset = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        let datasetPage;
        try {
          datasetPage = await client.dataset(run.defaultDatasetId).listItems({
            offset,
            limit,
          });
        } catch (datasetErr: any) {
          console.warn(`  ⚠️ Could not fetch dataset ${run.defaultDatasetId}: ${datasetErr.message}`);
          hasMore = false;
          break;
        }

        const items = datasetPage.items;
        if (items.length === 0) {
          hasMore = false;
          break;
        }

        console.log(`  Fetched page: offset ${offset}, count ${items.length}`);
        for (const item of items) {
          allScrapedItems.push({
            runId: run.id,
            actId: run.actId,
            item,
          });
        }

        totalItemsFetched += items.length;
        offset += items.length;
        if (items.length < limit) {
          hasMore = false;
        }
      }
    }
  }

  console.log(`\n✅ Total items retrieved across all Apify runs: ${totalItemsFetched}`);

  // Now, test matching all items against all 15 MLS listings
  console.log("\n🔍 Running matching engine across ALL scraped items and ALL 15 MLS listings...");
  let matchCount = 0;

  for (const record of allScrapedItems) {
    const raw = record.item;
    // Try both normalizers
    const normZ = normalizeZillowItem(raw);
    const normR = normalizeRealtorItem(raw);

    for (const listing of listings) {
      // Check Zillow normalized
      const matchZ = computeMatchConfidence(
        {
          mlsNumber: listing.mlsNumber,
          street: listing.address.street,
          city: listing.address.city,
          state: listing.address.state,
          zip: listing.address.zip,
          price: listing.price,
          agentName: (listing as any).listingAgent?.name,
        },
        {
          id: normZ.externalId || "ext-z",
          platform: "ZILLOW",
          externalId: normZ.externalId,
          address: normZ.address,
          city: normZ.city,
          state: normZ.state,
          zipCode: normZ.zipCode,
          price: normZ.price,
          agentName: normZ.agentName,
        }
      );

      if (matchZ.confidence >= 70) {
        matchCount++;
        console.log(`🎉 MATCH FOUND (Zillow normalizer)! MLS ${listing.mlsNumber} (${listing.address.street}) <=> Ext ${normZ.address}, Conf: ${matchZ.confidence}%`);
      }

      // Check Realtor normalized
      const matchR = computeMatchConfidence(
        {
          mlsNumber: listing.mlsNumber,
          street: listing.address.street,
          city: listing.address.city,
          state: listing.address.state,
          zip: listing.address.zip,
          price: listing.price,
          agentName: (listing as any).listingAgent?.name,
        },
        {
          id: normR.externalId || "ext-r",
          platform: "REALTOR",
          externalId: normR.externalId,
          address: normR.address,
          city: normR.city,
          state: normR.state,
          zipCode: normR.zipCode,
          price: normR.price,
          agentName: normR.agentName,
        }
      );

      if (matchR.confidence >= 70) {
        matchCount++;
        console.log(`🎉 MATCH FOUND (Realtor normalizer)! MLS ${listing.mlsNumber} (${listing.address.street}) <=> Ext ${normR.address}, Conf: ${matchR.confidence}%`);
      }
    }
  }

  if (matchCount === 0) {
    console.log("\n⚠️ No matches found between the 15 MLS listings and any items in your Apify runs.");
    console.log("Here are the actual addresses present in your Apify datasets:");
    const sampleAddresses = allScrapedItems.slice(0, 15).map(i => {
      const it = i.item;
      return it.address || it.streetAddress || (it.listingAddress && it.listingAddress.street) || "Unknown address";
    });
    console.log(sampleAddresses);
  } else {
    console.log(`\n🎉 Found ${matchCount} total matches!`);
  }
}

fetchAllApifyData().catch(console.error);
