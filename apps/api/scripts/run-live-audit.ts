import "dotenv/config";
import { executeAuditPipeline } from "../src/services/audit-pipeline.service";
import { prisma } from "../src/prisma";

async function runLiveAudit() {
  console.log("🚀 Starting live audit pipeline test...");
  const result = await executeAuditPipeline({ triggeredBy: "cli-test" });
  console.log("\nAudit result summary:");
  console.log("Status:", result.status);
  console.log("Listings Processed:", result.listingsProcessed);
  console.log("Listings Matched:", result.listingsMatched);
  console.log("Listings Unmatched:", result.listingsUnmatched);
  console.log("Discrepancies Created:", result.discrepanciesCreated);
  console.log("Platform Results:", JSON.stringify(result.platformResults, null, 2));

  const externalListings = await prisma.externalListing.findMany();
  console.log(`\nExternal Listings in DB: ${externalListings.length}`);
  for (const ext of externalListings) {
    console.log(`- Platform: ${ext.platform}, Address: ${ext.address}, Price: $${ext.price}, Match: ${ext.matchConfidence}%`);
  }

  const siteSnapshots = await prisma.siteSnapshot.findMany();
  console.log(`\nSite Snapshots in DB: ${siteSnapshots.length}`);
  for (const snap of siteSnapshots) {
    console.log(`- Site: ${snap.site}, Price: $${snap.price}, Street: ${snap.street}`);
  }
}

runLiveAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
