import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAuditStatus() {
  const listingsCount = await prisma.listing.count();
  const externalListingsCount = await prisma.externalListing.count();
  const siteSnapshotsCount = await prisma.siteSnapshot.count();
  const discrepanciesCount = await prisma.discrepancy.count();
  const auditRuns = await prisma.auditRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  console.log("=== DB AUDIT STATUS ===");
  console.log("Listings:", listingsCount);
  console.log("External Listings:", externalListingsCount);
  console.log("Site Snapshots:", siteSnapshotsCount);
  console.log("Discrepancies:", discrepanciesCount);
  console.log("Audit Runs:", JSON.stringify(auditRuns, null, 2));
}

checkAuditStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
