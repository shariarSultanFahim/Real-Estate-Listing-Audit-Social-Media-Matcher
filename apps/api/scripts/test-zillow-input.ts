import "dotenv/config";
import { ApifyClient } from "apify-client";
import { config } from "../src/config";

async function testZillow() {
  const client = new ApifyClient({ token: config.APIFY_API_TOKEN });
  try {
    const searchQuery = encodeURIComponent(JSON.stringify({
      pagination: {},
      usersSearchTerm: "Madisonville, LA",
      filterState: {
        sortSelection: { value: "globalrelevanceex" }
      }
    }));
    const searchUrl = `https://www.zillow.com/madisonville-la/?searchQueryState=${searchQuery}`;

    const zillowInput = {
      searchUrls: [
        { url: searchUrl }
      ],
      maxItems: 5,
    };
    console.log("Calling Zillow actor with:", JSON.stringify(zillowInput));
    const run = await client.actor(config.APIFY_ZILLOW_ACTOR_ID).call(zillowInput, { waitSecs: 30 });
    console.log("Zillow run status:", run.status);
    const dataset = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Zillow items count: ${dataset.items.length}`);
    if (dataset.items.length > 0) {
      console.log("Sample Zillow item keys:", Object.keys(dataset.items[0]));
      console.log("Sample Zillow item:", JSON.stringify(dataset.items[0], null, 2));
    }
  } catch (err: any) {
    console.error("Zillow error:", err.message);
  }
}

testZillow().catch(console.error);
