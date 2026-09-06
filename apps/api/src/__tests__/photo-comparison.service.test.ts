import { describe, it, expect } from "vitest";
import {
  computePhotoFingerprint,
  computeUnorderedSetFingerprint,
  comparePhotos,
  normalizePhotoUrl,
} from "../services/photo-comparison.service";

describe("Photo Comparison Service", () => {
  const photoA = "https://photos.example.com/listings/101/front-exterior.jpg";
  const photoB = "https://photos.example.com/listings/101/kitchen-gourmet.jpg";
  const photoC = "https://photos.example.com/listings/101/master-bedroom.jpg";
  const photoD = "https://photos.example.com/listings/101/backyard-pool.jpg";
  const photoE = "https://photos.example.com/listings/101/luxury-bathroom.jpg";

  it("normalizes photo URLs consistently", () => {
    expect(normalizePhotoUrl("https://photos.example.com/listings/101/front.jpg?w=800&q=75")).toBe(
      "photos.example.com/listings/101/front.jpg"
    );
    expect(normalizePhotoUrl("https://PHOTOS.EXAMPLE.COM/listings/101/front.jpg/")).toBe(
      "photos.example.com/listings/101/front.jpg"
    );
  });

  it("generates identical deterministic SHA-256 fingerprints for identical ordered photos", () => {
    const list1 = [photoA, photoB, photoC, photoD];
    const list2 = [photoA, photoB, photoC, photoD];

    const hash1 = computePhotoFingerprint(list1);
    const hash2 = computePhotoFingerprint(list2);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string
  });

  it("detects identical photo lists as NO_DIFFERENCE", async () => {
    const result = await comparePhotos(
      "list-101",
      "zillow",
      [photoA, photoB, photoC],
      [photoA, photoB, photoC]
    );

    expect(result.hasDiscrepancy).toBe(false);
    expect(result.discrepancyType).toBe("NO_DIFFERENCE");
  });

  it("detects altered photo sequence as PHOTO_ORDER_MISMATCH", async () => {
    const sourceOrder = [photoA, photoB, photoC, photoD];
    const alteredOrder = [photoA, photoC, photoB, photoD]; // B and C swapped

    const result = await comparePhotos("list-101", "zillow", sourceOrder, alteredOrder);

    expect(result.hasDiscrepancy).toBe(true);
    expect(result.discrepancyType).toBe("PHOTO_ORDER_MISMATCH");
    expect(result.sourceFingerprint).not.toBe(result.siteFingerprint);
    expect(result.sourcePhotoCount).toBe(4);
    expect(result.sitePhotoCount).toBe(4);
  });

  it("detects missing photos correctly", async () => {
    const source = [photoA, photoB, photoC, photoD];
    const siteMissingOne = [photoA, photoB, photoC]; // photoD missing

    const result = await comparePhotos("list-101", "realtor", source, siteMissingOne);

    expect(result.hasDiscrepancy).toBe(true);
    expect(result.discrepancyType).toBe("MISSING_PHOTOS");
    expect(result.sitePhotoCount).toBe(3);
    expect(result.sourcePhotoCount).toBe(4);
  });

  it("detects extra / new photos correctly", async () => {
    const source = [photoA, photoB];
    const siteExtra = [photoA, photoB, photoE];

    const result = await comparePhotos("list-101", "lacdb", source, siteExtra);

    expect(result.hasDiscrepancy).toBe(true);
    expect(result.discrepancyType).toBe("NEW_PHOTOS");
  });

  it("detects completely different photo sets", async () => {
    const source = [photoA, photoB];
    const site = [photoC, photoD, photoE];

    const result = await comparePhotos("list-101", "zillow", source, site, {
      approvedFingerprints: [],
    });

    expect(result.hasDiscrepancy).toBe(true);
    expect(result.discrepancyType).toBe("DIFFERENT_PHOTOS");
  });

  it("suppresses discrepancy when photo arrangement is in approved fingerprints list", async () => {
    const sourceOrder = [photoA, photoB, photoC];
    const alteredOrder = [photoC, photoA, photoB];
    const approvedFingerprint = computePhotoFingerprint(alteredOrder);

    const result = await comparePhotos("list-101", "zillow", sourceOrder, alteredOrder, {
      approvedFingerprints: [approvedFingerprint],
    });

    expect(result.hasDiscrepancy).toBe(false);
    expect(result.isApprovedArrangement).toBe(true);
    expect(result.discrepancyType).toBe("PHOTO_ORDER_MISMATCH");
    expect(result.explanation).toContain("explicitly approved by staff");
  });
});
