import "dotenv/config";
import { ApifyClient } from "apify-client";
import { config } from "../src/config";

async function testApify() {
  console.log("Testing Apify integration with credentials:");
  console.log("Token:", config.APIFY_API_TOKEN ? `${config.APIFY_API_TOKEN.slice(0, 15)}...` : "NOT SET");
  console.log("Zillow Actor:", config.APIFY_ZILLOW_ACTOR_ID);
  console.log("Realtor Actor:", config.APIFY_REALTOR_ACTOR_ID);

  const client = new ApifyClient({ token: config.APIFY_API_TOKEN });

  try {
    const user = await client.user().get();
    console.log("✓ Authenticated Apify user:", user?.username || user?.id);
  } catch (err: any) {
    console.error("❌ Apify Authentication Error:", err.message);
    return;
  }

  // Check Zillow Actor
  try {
    console.log("\nFetching details for Zillow actor ID:", config.APIFY_ZILLOW_ACTOR_ID);
    const zillowActor = await client.actor(config.APIFY_ZILLOW_ACTOR_ID).get();
    console.log("✓ Zillow Actor Name:", zillowActor?.name, "Title:", zillowActor?.title);
  } catch (err: any) {
    console.error("❌ Zillow Actor fetch error:", err.message);
  }

  // Check Realtor Actor
  try {
    console.log("\nFetching details for Realtor actor ID:", config.APIFY_REALTOR_ACTOR_ID);
    const realtorActor = await client.actor(config.APIFY_REALTOR_ACTOR_ID).get();
    console.log("✓ Realtor Actor Name:", realtorActor?.name, "Title:", realtorActor?.title);
  } catch (err: any) {
    console.error("❌ Realtor Actor fetch error:", err.message);
  }
}

testApify().catch(console.error);
