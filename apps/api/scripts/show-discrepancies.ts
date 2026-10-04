import { PrismaClient } from "@prisma/client";
const p = new PrismaClient({ log: [] });
(async () => {
  const listingCount = await p.listing.count();
  const auditRun = await p.auditRun.findFirst({ orderBy: { startedAt: "desc" } });
  const discrepancies = await p.discrepancy.findMany({ orderBy: { detectedAt: "asc" } });

  console.log("\n📊 DATABASE SUMMARY");
  console.log("=".repeat(60));
  console.log(`  Listings:         ${listingCount}`);
  console.log(`  AuditRun Status:  ${auditRun?.status}`);
  console.log(`  Processed:        ${auditRun?.listingsProcessed}`);
  console.log(`  Matched:          ${auditRun?.listingsMatched}`);
  console.log(`  Not Found:        ${auditRun?.listingsUnmatched}`);
  console.log(`  Discrepancies:    ${auditRun?.discrepanciesCreated}`);
  console.log("\n⚠️  DISCREPANCY DETAIL");
  console.log("=".repeat(90));

  for (const d of discrepancies) {
    const listing = await p.listing.findUnique({ where: { id: d.listingId }, select: { mlsNumber: true, street: true } });
    console.log(`  MLS ${listing?.mlsNumber} | Field: ${d.field.padEnd(14)} | MLS: ${d.sourceValue.substring(0, 38).padEnd(38)} | Zillow: ${d.siteValue.substring(0, 35)}`);
  }
  console.log("");

  await p.$disconnect();
})();
