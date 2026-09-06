import { describe, it, expect } from "vitest";
import { compareListingToSnapshot, haversineDistanceMiles } from "../services/comparison.service";
import { Listing, SiteSnapshot, Prisma } from "@prisma/client";

describe("Comparison Service", () => {
  const baseListing: Listing & { photos: { url: string; position: number }[] } = {
    id: "list-101",
    mlsNumber: "MLS-2026-9012",
    street: "742 Evergreen Terrace",
    addressLine2: null,
    city: "Covington",
    state: "LA",
    zip: "70433",
    price: new Prisma.Decimal(485000),
    status: "active",
    propertyType: "Single Family",
    propertyStyle: "Craftsman",
    subdivision: "Covington Woods",
    beds: 4,
    fullBaths: 3,
    halfBaths: 1,
    buildingAreaSqft: new Prisma.Decimal(3200),
    lotSizeAcres: new Prisma.Decimal(0.65),
    yearBuilt: 2021,
    parkingPlaces: 2,
    newConstruction: false,
    listingType: "Residential Sales",
    features: ["Pool", "Quartz Countertops"],
    description: "Stunning 4-bedroom Craftsman home with private heated pool.",
    legalDescription: "LOT 14 SQ 3 COVINGTON WOODS",
    lat: new Prisma.Decimal(30.4755),
    lng: new Prisma.Decimal(-90.1009),
    listDate: new Date("2026-07-15"),
    expirationDate: new Date("2027-01-15"),
    anticipatedLaunchDate: null,
    lastUpdatedAt: new Date(),
    mlsSource: "Crescent MLS",
    approvedPhotoArrangementHash: null,
    listingAgentId: "agent-4",
    listingOfficeId: "off-la-01",
    photos: [
      { url: "https://photos.example.com/front.jpg", position: 1 },
      { url: "https://photos.example.com/kitchen.jpg", position: 2 },
    ],
  };

  it("identifies matching price with no discrepancy", async () => {
    const snapshot: SiteSnapshot = {
      id: "snap-1",
      listingId: "list-101",
      site: "zillow",
      fetchedAt: new Date(),
      price: new Prisma.Decimal(485000),
      street: "742 Evergreen Terrace",
      city: "Covington",
      state: "LA",
      zip: "70433",
      description: "Stunning 4-bedroom Craftsman home with private heated pool.",
      lat: new Prisma.Decimal(30.4755),
      lng: new Prisma.Decimal(-90.1009),
      photos: [
        { url: "https://photos.example.com/front.jpg", order: 1 },
        { url: "https://photos.example.com/kitchen.jpg", order: 2 },
      ],
      sourceUrl: "https://zillow.com/homedetails/101",
    };

    const diffs = await compareListingToSnapshot({
      listing: baseListing,
      snapshot,
      site: "zillow",
    });

    expect(diffs).toHaveLength(0);
  });

  it("detects price mismatch", async () => {
    const snapshot: SiteSnapshot = {
      id: "snap-2",
      listingId: "list-101",
      site: "zillow",
      fetchedAt: new Date(),
      price: new Prisma.Decimal(510000), // $25k higher
      street: "742 Evergreen Terrace",
      city: "Covington",
      state: "LA",
      zip: "70433",
      description: "Stunning 4-bedroom Craftsman home with private heated pool.",
      lat: new Prisma.Decimal(30.4755),
      lng: new Prisma.Decimal(-90.1009),
      photos: null,
      sourceUrl: "https://zillow.com/homedetails/101",
    };

    const diffs = await compareListingToSnapshot({
      listing: baseListing,
      snapshot,
      site: "zillow",
    });

    const priceDiff = diffs.find((d) => d.field === "price");
    expect(priceDiff).toBeDefined();
    expect(priceDiff?.sourceValue).toBe("$485,000");
    expect(priceDiff?.siteValue).toBe("$510,000");
  });

  it("calculates Haversine distance and detects misplaced pins (>0.1 miles)", () => {
    // 0.6 miles offset
    const distance = haversineDistanceMiles(30.3674, -89.0928, 30.371, -89.085);
    expect(distance).toBeGreaterThan(0.1);
    expect(distance).toBeCloseTo(0.53, 1);
  });

  it("flags not_found discrepancy when external snapshot is null", async () => {
    const diffs = await compareListingToSnapshot({
      listing: baseListing,
      snapshot: null,
      site: "lacdb",
    });

    expect(diffs).toHaveLength(1);
    expect(diffs[0].field).toBe("not_found");
    expect(diffs[0].siteValue).toContain("Listing not found on lacdb");
  });
});
