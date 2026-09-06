import { Listing } from "@prisma/client";
import { config } from "../config";
import {
  normalizeAddress,
  normalizePrice,
  normalizeAgentName,
  addressSimilarity,
} from "./normalization.service";

export interface ExternalListingCandidate {
  id: string;
  platform: string;
  externalId?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  price?: number | null;
  agentName?: string | null;
  rawData?: Record<string, unknown>;
}

export type ConfidenceTier = "high" | "strong" | "possible_review" | "unmatched";

export type MatchedBy =
  | "mls_id"
  | "exact_normalized_address"
  | "address_and_zip"
  | "address_and_price"
  | "fuzzy_address"
  | "manual"
  | "none";

export interface MatchSignalBreakdown {
  mlsIdExact: boolean;
  exactNormalizedAddress: boolean;
  normalizedAddressMatch: boolean;
  addressSimilarityRatio: number;
  zipMatched: boolean;
  priceDifferenceRatio: number | null;
  agentNameMatched: boolean;
}

export interface MatchResult {
  externalId: string;
  confidence: number; // 0–100
  confidenceTier: ConfidenceTier;
  reasons: string[];
  matchedBy: MatchedBy;
  signals: MatchSignalBreakdown;
}

export interface MatchOptions {
  threshold?: number;
  highConfidenceThreshold?: number;
}

/**
 * Computes a confidence score (0–100) between a client listing (Source of Truth)
 * and an external scraped listing candidate.
 *
 * Scoring Ladder:
 *  - Exact MLS ID: 100 (Immediate High Confidence Match)
 *  - Exact Normalized Address: 95
 *  - Address Similarity + ZIP code: up to 80
 *  - Address Match + Price proximity (within 1%): +10 bonus
 *  - Address Match + Agent name match: +5 bonus
 *
 * Confidence Tiers:
 *  - 95–100: High-confidence automatic match
 *  - 80–94: Strong match
 *  - 70–79: Possible match requiring review
 *  - <70: Unmatched
 */
export function computeMatchConfidence(
  listing: Pick<Listing, "mlsNumber" | "street" | "city" | "state" | "zip"> & {
    price: { toNumber(): number } | number;
    agentName?: string;
  },
  external: ExternalListingCandidate
): MatchResult {
  const reasons: string[] = [];
  let confidence = 0;
  let matchedBy: MatchedBy = "none";

  const signals: MatchSignalBreakdown = {
    mlsIdExact: false,
    exactNormalizedAddress: false,
    normalizedAddressMatch: false,
    addressSimilarityRatio: 0,
    zipMatched: false,
    priceDifferenceRatio: null,
    agentNameMatched: false,
  };

  const listingPrice =
    typeof listing.price === "number" ? listing.price : listing.price.toNumber();

  // ── Signal 1: Exact MLS ID ──────────────────────────────────
  if (
    external.externalId &&
    listing.mlsNumber &&
    external.externalId.replace(/\D/g, "") === listing.mlsNumber.replace(/\D/g, "") &&
    listing.mlsNumber.replace(/\D/g, "").length > 0
  ) {
    signals.mlsIdExact = true;
    return {
      externalId: external.id,
      confidence: 100,
      confidenceTier: "high",
      reasons: ["Exact MLS ID match"],
      matchedBy: "mls_id",
      signals,
    };
  }

  // ── Signal 2: Address Matching ──────────────────────────────
  const normalizedSource = normalizeAddress(
    listing.street,
    listing.city,
    listing.state,
    listing.zip
  );

  const hasExtAddress = external.address && external.city && external.state;

  if (hasExtAddress) {
    const normalizedExt = normalizeAddress(
      external.address!,
      external.city!,
      external.state!,
      external.zipCode || listing.zip
    );

    if (normalizedSource === normalizedExt) {
      confidence = 95;
      matchedBy = "exact_normalized_address";
      signals.exactNormalizedAddress = true;
      signals.normalizedAddressMatch = true;
      signals.addressSimilarityRatio = 1.0;
      signals.zipMatched =
        !!external.zipCode &&
        listing.zip.substring(0, 5) === external.zipCode.substring(0, 5);
      reasons.push("Exact normalized address match");
    } else {
      const sim = addressSimilarity(normalizedSource, normalizedExt);
      signals.addressSimilarityRatio = Math.round(sim * 100) / 100;

      if (sim >= 0.7) {
        const baseScore = Math.round(sim * 60); // up to 60
        confidence = baseScore;
        matchedBy = "fuzzy_address";
        signals.normalizedAddressMatch = true;
        reasons.push(`Address similarity: ${Math.round(sim * 100)}%`);
      }

      // ZIP code verification bonus
      if (
        external.zipCode &&
        listing.zip.substring(0, 5) === external.zipCode.substring(0, 5)
      ) {
        signals.zipMatched = true;
        confidence = Math.min(100, confidence + 15);
        if (matchedBy === "fuzzy_address") {
          matchedBy = "address_and_zip";
        }
        reasons.push("ZIP code match");
      }
    }
  }

  // ── Signal 3: Price Proximity (±1%) ─────────────────────────
  if (external.price != null && confidence >= 40) {
    const extPrice = normalizePrice(external.price);
    if (listingPrice > 0) {
      const priceDiffRatio = Math.abs(listingPrice - extPrice) / listingPrice;
      signals.priceDifferenceRatio = Math.round(priceDiffRatio * 1000) / 1000;

      if (priceDiffRatio <= 0.01) {
        confidence = Math.min(100, confidence + 10);
        if (matchedBy === "fuzzy_address") {
          matchedBy = "address_and_price";
        }
        reasons.push("Price within 1%");
      } else if (priceDiffRatio <= 0.05) {
        confidence = Math.min(100, confidence + 5);
        reasons.push("Price within 5%");
      }
    }
  }

  // ── Signal 4: Agent Name Matching ───────────────────────────
  if (external.agentName && listing.agentName && confidence >= 50) {
    const normListingAgent = normalizeAgentName(listing.agentName);
    const normExtAgent = normalizeAgentName(external.agentName);
    if (normListingAgent === normExtAgent) {
      signals.agentNameMatched = true;
      confidence = Math.min(100, confidence + 5);
      reasons.push("Listing agent match");
    }
  }

  // ── Determine Confidence Tier ───────────────────────────────
  let confidenceTier: ConfidenceTier = "unmatched";
  if (confidence >= (config.MATCH_HIGH_CONFIDENCE_THRESHOLD ?? 95)) {
    confidenceTier = "high";
  } else if (confidence >= 80) {
    confidenceTier = "strong";
  } else if (confidence >= (config.MATCH_CONFIDENCE_THRESHOLD ?? 70)) {
    confidenceTier = "possible_review";
  } else {
    confidenceTier = "unmatched";
    matchedBy = "none";
  }

  return {
    externalId: external.id,
    confidence,
    confidenceTier,
    reasons,
    matchedBy,
    signals,
  };
}

/**
 * Filter candidates to find the highest-scoring candidate that exceeds the threshold.
 * If no candidate meets the threshold, returns null (unmatched).
 */
export function findBestMatch(
  listing: Parameters<typeof computeMatchConfidence>[0],
  candidates: ExternalListingCandidate[],
  opts: MatchOptions = {}
): (MatchResult & { candidate: ExternalListingCandidate }) | null {
  const threshold = opts.threshold ?? config.MATCH_CONFIDENCE_THRESHOLD ?? 70;
  let best: (MatchResult & { candidate: ExternalListingCandidate }) | null = null;

  for (const candidate of candidates) {
    const result = computeMatchConfidence(listing, candidate);
    if (result.confidence >= threshold) {
      if (!best || result.confidence > best.confidence) {
        best = { ...result, candidate };
      }
    }
  }

  return best;
}
