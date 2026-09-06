import "dotenv/config";
import { ApifyClient } from "apify-client";
import { config } from "../src/config";

async function getRealtorInputSchema() {
  const client = new ApifyClient({ token: config.APIFY_API_TOKEN });
  const build = await client.actor(config.APIFY_REALTOR_ACTOR_ID).version("1.0").get();
  console.log("Realtor input schema:", JSON.stringify(build?.inputSchema, null, 2));
}

getRealtorInputSchema().catch(console.error);
