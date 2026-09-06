import "dotenv/config";
import { ApifyClient } from "apify-client";
import { config } from "../src/config";

async function getActorSchema() {
  const client = new ApifyClient({ token: config.APIFY_API_TOKEN });
  const zillowActor = await client.actor(config.APIFY_ZILLOW_ACTOR_ID).get();
  console.log("Zillow Actor:", JSON.stringify(zillowActor?.exampleRunInput, null, 2));

  const realtorActor = await client.actor(config.APIFY_REALTOR_ACTOR_ID).get();
  console.log("Realtor Actor:", JSON.stringify(realtorActor?.exampleRunInput, null, 2));
}

getActorSchema().catch(console.error);
