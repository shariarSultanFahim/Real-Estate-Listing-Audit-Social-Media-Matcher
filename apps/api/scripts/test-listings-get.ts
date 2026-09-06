import { findAll } from "../src/modules/listings/listings.service";
import { ListingSchema } from "../../../packages/validation/src/index";
import { z } from "zod";

async function testListings() {
  const listings = await findAll();
  console.log(`Found ${listings.length} listings from listings.service.findAll()`);
  try {
    const parsed = z.array(ListingSchema).parse(listings);
    console.log(`✓ Zod ListingSchema successfully parsed all ${parsed.length} listings!`);
  } catch (err: any) {
    console.error("❌ Zod parse error:", JSON.stringify(err.errors || err, null, 2));
  }
}

testListings().catch(console.error);
