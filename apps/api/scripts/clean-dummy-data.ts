import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDummyData() {
  console.log("🧹 Purging all dummy seeded data from database...");

  // Delete all child and dependent tables first
  const deletedDiscrepancies = await prisma.discrepancy.deleteMany({});
  console.log(`  - Deleted ${deletedDiscrepancies.count} discrepancies`);

  const deletedPhotos = await prisma.listingPhoto.deleteMany({});
  console.log(`  - Deleted ${deletedPhotos.count} listing photos`);

  const deletedSnapshots = await prisma.siteSnapshot.deleteMany({});
  console.log(`  - Deleted ${deletedSnapshots.count} site snapshots`);

  const deletedExternal = await prisma.externalListing.deleteMany({});
  console.log(`  - Deleted ${deletedExternal.count} external listings`);

  const deletedListings = await prisma.listing.deleteMany({});
  console.log(`  - Deleted ${deletedListings.count} listings`);

  const deletedAgents = await prisma.agent.deleteMany({});
  console.log(`  - Deleted ${deletedAgents.count} agents`);

  const deletedOffices = await prisma.listingOffice.deleteMany({});
  console.log(`  - Deleted ${deletedOffices.count} offices`);

  // Delete non-admin users, keeping only superAdmin
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: "admin@cresentsothebys.com",
      },
    },
  });
  console.log(`  - Deleted ${deletedUsers.count} non-admin users`);

  console.log("✅ Database dummy data successfully purged!");
}

cleanDummyData()
  .catch((e) => {
    console.error("Error cleaning dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
