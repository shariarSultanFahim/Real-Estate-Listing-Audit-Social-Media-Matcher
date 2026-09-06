import "dotenv/config";
import { runActor, waitForRun, getDatasetItems } from "../src/integrations/apify/apify.client";
import { config } from "../src/config";

async function testZip() {
  const run = await runActor(config.APIFY_REALTOR_ACTOR_ID, {
    zipCodes: ["70447"],
    maxResults: 5,
  });
  if (!run) return;
  const completed = await waitForRun(run.runId);
  if (completed?.defaultDatasetId) {
    const items = await getDatasetItems<Record<string, unknown>>(completed.defaultDatasetId);
    console.log(`Scraped ${items.length} items by zip 70447:`);
    for (const item of items) {
      console.log(`- ${item.address}, ${item.city}, ${item.stateCode} ${item.postalCode} | Price: $${item.listPrice} | MLS: ${item.mlsListingId || item.mlsId}`);
    }
  }
}

testZip().catch(console.error);
