import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectListing() {
  const listings = await prisma.listing.findMany();
  console.log("Listings:", JSON.stringify(listings, null, 2));

  const discrepancies = await prisma.discrepancy.findMany();
  console.log("Discrepancies:", JSON.stringify(discrepancies, null, 2));
}

inspectListing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
