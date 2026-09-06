import "dotenv/config";
import { ApifyClient } from "apify-client";
import { config } from "../src/config";

async function testActorCall() {
  const client = new ApifyClient({ token: config.APIFY_API_TOKEN });

  console.log("1. Testing Zillow Actor call...");
  try {
    const zillowInput = {
      search: "800 LA-1085, Madisonville, LA 70447",
      startUrls: [
        { url: "https://www.zillow.com/homes/800-LA-1085,-Madisonville,-LA-70447_rb/" }
      ],
      maxItems: 3,
    };
    console.log("Calling Zillow actor with input:", zillowInput);
    const run = await client.actor(config.APIFY_ZILLOW_ACTOR_ID).call(zillowInput, { waitSecs: 30 });
    console.log("Zillow run finished status:", run.status);
    const dataset = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Zillow items count: ${dataset.items.length}`);
    if (dataset.items.length > 0) {
      console.log("Sample Zillow Item keys:", Object.keys(dataset.items[0]));
      console.log("Sample Zillow Item:", JSON.stringify(dataset.items[0], null, 2));
    }
  } catch (err: any) {
    console.error("Zillow call error:", err.message);
  }

  console.log("\n2. Testing Realtor Actor call...");
  try {
    const realtorInput = {
      location: "Madisonville, LA",
      maxResults: 3,
    };
    console.log("Calling Realtor actor with input:", realtorInput);
    const run = await client.actor(config.APIFY_REALTOR_ACTOR_ID).call(realtorInput, { waitSecs: 30 });
    console.log("Realtor run finished status:", run.status);
    const dataset = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Realtor items count: ${dataset.items.length}`);
    if (dataset.items.length > 0) {
      console.log("Sample Realtor Item keys:", Object.keys(dataset.items[0]));
      console.log("Sample Realtor Item:", JSON.stringify(dataset.items[0], null, 2));
    }
  } catch (err: any) {
    console.error("Realtor call error:", err.message);
  }
}

testActorCall().catch(console.error);
