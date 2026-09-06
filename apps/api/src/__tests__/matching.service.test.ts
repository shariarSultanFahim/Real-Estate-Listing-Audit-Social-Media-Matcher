import { describe, it, expect } from "vitest";
import { computeMatchConfidence, findBestMatch } from "../services/matching.service";
import { normalizeAddress, normalizePrice } from "../services/normalization.service";

describe("Matching Service", () => {
  const baseListing = {
    mlsNumber: "MLS-2026-9012",
    street: "742 Evergreen Terrace",
    city: "Covington",
    state: "LA",
    zip: "70433",
    price: 485000,
    agentName: "David Miller",
  };

  it("assigns 100% confidence and 'high' tier on exact MLS ID match", () => {
    const candidate = {
      id: "cand-1",
      platform: "ZILLOW",
      externalId: "MLS-2026-9012",
      address: "Unknown Address",
      city: "Covington",
      state: "LA",
      zipCode: "70433",
      price: 500000,
    };

    const result = computeMatchConfidence(baseListing, candidate);
    expect(result.confidence).toBe(100);
    expect(result.confidenceTier).toBe("high");
    expect(result.matchedBy).toBe("mls_id");
    expect(result.signals.mlsIdExact).toBe(true);
  });

  it("assigns 95% confidence on exact normalized address with street abbreviation differences", () => {
    const candidate = {
      id: "cand-2",
      platform: "ZILLOW",
      externalId: "ZPID-98765",
      address: "742 Evergreen Ter.", // Abbreviation difference
      city: "Covington",
      state: "LA",
      zipCode: "70433",
      price: 485000,
    };

    const result = computeMatchConfidence(baseListing, candidate);
    expect(result.confidence).toBeGreaterThanOrEqual(95);
    expect(result.confidenceTier).toBe("high");
    expect(result.signals.exactNormalizedAddress).toBe(true);
    expect(result.signals.normalizedAddressMatch).toBe(true);
  });

  it("handles street abbreviations reliably in normalization", () => {
    expect(normalizeAddress("100 Main Street", "New Orleans", "LA", "70112")).toBe(
      normalizeAddress("100 MAIN ST.", "New Orleans", "LA", "70112")
    );
    expect(normalizeAddress("500 Ocean Boulevard", "Gulfport", "MS", "39501")).toBe(
      normalizeAddress("500 Ocean Blvd", "GULFPORT", "ms", "39501")
    );
  });

  it("normalizes prices properly across formats", () => {
    expect(normalizePrice("$485,000")).toBe(485000);
    expect(normalizePrice(485000)).toBe(485000);
    expect(normalizePrice("$485,000.49")).toBe(485000);
    expect(normalizePrice(" 725000 ")).toBe(725000);
  });

  it("awards price proximity and ZIP bonuses for fuzzy address matches", () => {
    const candidate = {
      id: "cand-3",
      platform: "REALTOR",
      externalId: "PROP-1234",
      address: "742 Evergreen Terrace Apt 1",
      city: "Covington",
      state: "LA",
      zipCode: "70433",
      price: 487000, // within 1%
      agentName: "David Miller",
    };

    const result = computeMatchConfidence(baseListing, candidate);
    expect(result.confidence).toBeGreaterThanOrEqual(70);
    expect(result.signals.zipMatched).toBe(true);
    expect(result.signals.priceDifferenceRatio).toBeLessThanOrEqual(0.01);
  });

  it("categorizes completely different property as unmatched (<70)", () => {
    const candidate = {
      id: "cand-4",
      platform: "ZILLOW",
      externalId: "ZPID-1111",
      address: "128 Beach Boulevard",
      city: "Gulfport",
      state: "MS",
      zipCode: "39501",
      price: 725000,
    };

    const result = computeMatchConfidence(baseListing, candidate);
    expect(result.confidence).toBeLessThan(70);
    expect(result.confidenceTier).toBe("unmatched");
    expect(result.matchedBy).toBe("none");
  });

  it("findBestMatch picks the highest scoring candidate above threshold", () => {
    const candidates = [
      {
        id: "cand-wrong",
        platform: "ZILLOW",
        address: "999 Oak Road",
        city: "Covington",
        state: "LA",
        zipCode: "70433",
        price: 200000,
      },
      {
        id: "cand-correct",
        platform: "ZILLOW",
        externalId: "ZPID-98765",
        address: "742 Evergreen Ter",
        city: "Covington",
        state: "LA",
        zipCode: "70433",
        price: 485000,
      },
    ];

    const match = findBestMatch(baseListing, candidates, { threshold: 70 });
    expect(match).not.toBeNull();
    expect(match?.candidate.id).toBe("cand-correct");
    expect(match?.confidenceTier).toBe("high");
  });
});
