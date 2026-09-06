import "dotenv/config";
import { ApifyClient } from "apify-client";
import { config } from "../src/config";

async function inspectActorDetails() {
  const client = new ApifyClient({ token: config.APIFY_API_TOKEN });
  const realtorActor = await client.actor(config.APIFY_REALTOR_ACTOR_ID).get();
  console.log("Realtor Actor definition:", JSON.stringify(realtorActor, null, 2));
}

inspectActorDetails().catch(console.error);
