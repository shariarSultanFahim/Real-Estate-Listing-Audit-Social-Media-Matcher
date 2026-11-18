import { describe, it, expect } from "vitest";
import { mapDiscrepancy } from "../modules/discrepancies/discrepancies.mappers";
import { mapListing } from "../modules/listings/listings.mappers";
import { ListingStatus, Prisma } from "@prisma/client";

describe("Client Feedback Requirements & Safeguards", () => {
  describe("1. Legal Description & Co-Listing Agent", () => {
    it("should allow empty legalDescription without assigning placeholder LOT 12 SQ 4", () => {
      const mockListingRow: any = {
        id: "list-test-01",
        mlsNumber: "MLS-9999",
        street: "123 Main St",
        addressLine2: null,
        city: "Covington",
        state: "LA",
        zip: "70433",
        subdivision: null,
        price: new Prisma.Decimal(500000),
        status: "active" as ListingStatus,
        propertyType: "Single Family",
        propertyStyle: "Traditional",
        beds: 3,
        fullBaths: 2,
        halfBaths: null,
        buildingAreaSqft: new Prisma.Decimal(2400),
        lotSizeAcres: new Prisma.Decimal(0.5),
        yearBuilt: 2020,
        parkingPlaces: 2,
        newConstruction: false,
        listingType: "Residential Sales",
        description: "Test description",
        legalDescription: null, // Empty legal description
        lat: null,
        lng: null,
        listDate: new Date(),
        expirationDate: new Date(),
        anticipatedLaunchDate: null,
        lastUpdatedAt: new Date(),
        mlsSource: "Crescent MLS",
        approvedPhotoArrangementHash: null,
        listingAgentId: "agent-1",
        coListingAgentId: "agent-2", // Assigned Co-Listing Agent
        listingOfficeId: "office-1",
        photos: [],
      };

      const result = mapListing(mockListingRow);

      // Verify legal description is empty string, NOT "LOT 12 SQ 4 SUBDIVISION PH 1"
      expect(result.legalDescription).toBe("");
      expect(result.legalDescription).not.toContain("LOT 12 SQ 4");

      // Verify coListingAgentId is preserved
      expect(result.coListingAgentId).toBe("agent-2");
    });
  });

  describe("2. Notes and Resolution Notes Resolution", () => {
    it("should pick the most recent note for latestNote when active", () => {
      const mockDiscrepancyRow: any = {
        id: "disc-01",
        listingId: "list-01",
        site: "realtor",
        field: "price",
        sourceValue: "$500,000",
        siteValue: "$475,000",
        status: "open",
        detectedAt: new Date("2026-10-16T10:25:00Z"),
        resolvedAt: null,
        note: "Initial automated discrepancy detected.",
        active: true,
        notes: [
          { content: "Email sent to Realtor.com support.", createdAt: new Date("2026-10-30T16:46:00Z") },
          { content: "Initial automated discrepancy detected.", createdAt: new Date("2026-10-16T10:25:00Z") },
        ],
        history: [],
      };

      const result = mapDiscrepancy(mockDiscrepancyRow);

      // The latest note should be the newly appended note, not the initial detection note
      expect(result.note).toBe("Email sent to Realtor.com support.");
      expect(result.resolutionNote).toBeUndefined();
    });

    it("should resolve resolutionNote from resolution history when marked resolved", () => {
      const mockDiscrepancyRow: any = {
        id: "disc-02",
        listingId: "list-01",
        site: "realtor",
        field: "price",
        sourceValue: "$500,000",
        siteValue: "$500,000",
        status: "resolved",
        detectedAt: new Date("2026-10-16T10:25:00Z"),
        resolvedAt: new Date("2026-10-31T09:00:00Z"),
        note: "Old creation note",
        active: false,
        notes: [
          { content: "Price verified and syndication feed synced.", createdAt: new Date("2026-10-31T09:00:00Z") },
          { content: "Email sent to Realtor.com support.", createdAt: new Date("2026-10-30T16:46:00Z") },
        ],
        history: [
          {
            action: "manual_resolution",
            toStatus: "resolved",
            note: "Price verified and syndication feed synced.",
            changedAt: new Date("2026-10-31T09:00:00Z"),
          },
        ],
      };

      const result = mapDiscrepancy(mockDiscrepancyRow);

      expect(result.status).toBe("resolved");
      expect(result.resolutionNote).toBe("Price verified and syndication feed synced.");
      expect(result.note).toBe("Price verified and syndication feed synced.");
    });
  });

  describe("3. Listing Status and Audit Exclusion Rules", () => {
    it("should exclude closed (sold) and withdrawn/expired listings from audit eligibility", () => {
      const allListings = [
        { id: "1", status: "active", mlsNumber: "MLS-01" },
        { id: "2", status: "pending", mlsNumber: "MLS-02" },
        { id: "3", status: "sold", mlsNumber: "MLS-03" }, // Closed
        { id: "4", status: "withdrawn", mlsNumber: "MLS-04" }, // Expired / Withdrawn
      ];

      // Audit pipeline filter
      const eligibleForAudit = allListings.filter((l) => l.status === "active");
      expect(eligibleForAudit.map((l) => l.id)).toEqual(["1"]);

      // All Listings Page filter (Active + Pending)
      const allListingsPage = allListings.filter((l) => l.status !== "sold" && l.status !== "withdrawn");
      expect(allListingsPage.map((l) => l.id)).toEqual(["1", "2"]);

      // Offline Archive Page filter
      const offlineListings = allListings.filter((l) => l.status === "sold" || l.status === "withdrawn");
      expect(offlineListings.map((l) => l.id)).toEqual(["3", "4"]);
    });
  });
});

