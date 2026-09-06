import "dotenv/config";
import { scrapeRealtor } from "../src/integrations/apify/apify.service";
import { normalizeRealtorItem } from "../src/integrations/apify/actors/realtor.actor";
import { runActor, waitForRun, getDatasetItems } from "../src/integrations/apify/apify.client";
import { config } from "../src/config";

async function testRealtorScrape() {
  console.log("Testing Realtor scrape for Madisonville, LA...");
  const run = await runActor(config.APIFY_REALTOR_ACTOR_ID, {
    location: "800 LA-1085, Madisonville, LA 70447",
    maxResults: 5,
  });

  if (!run) {
    console.error("Run failed to start");
    return;
  }

  const completed = await waitForRun(run.runId);
  console.log("Realtor run completed:", completed?.status);

  if (completed?.defaultDatasetId) {
    const items = await getDatasetItems<Record<string, unknown>>(completed.defaultDatasetId);
    console.log(`Scraped ${items.length} items from Realtor:`);
    for (const item of items) {
      console.log(`- Address: ${item.address}, City: ${item.city}, Price: $${item.listPrice}, Agent: ${item.agentName}`);
    }
  }
}

testRealtorScrape().catch(console.error);
