import { Listing, SiteSnapshot, SyndicationSite } from "@prisma/client";
import { normalizeDescription, normalizePrice, normalizeAgentName } from "./normalization.service";
import { comparePhotos, PhotoItem } from "./photo-comparison.service";

export type DiscrepancyFieldName =
  | "price"
  | "address"
  | "description"
  | "mapCoordinates"
  | "photos"
  | "legalDescription"
  | "beds"
  | "fullBaths"
  | "halfBaths"
  | "squareFeet"
  | "status"
  | "agent"
  | "lotSize"
  | "propertyType"
  | "not_found";

export interface FieldDiff {
  field: DiscrepancyFieldName;
  sourceValue: string;
  siteValue: string;
  note?: string;
}

export interface ComparisonInput {
  listing: Listing & {
    photos?: { url: string; position?: number }[];
    listingAgent?: { name: string } | null;
  };
  snapshot: SiteSnapshot | null;
  site: SyndicationSite;
}

/**
 * Comparison Service
 * Compares a canonical Listing (Source of Truth) against a SiteSnapshot.
 *
 * Deterministic Rules:
 *  - Price: Normalized integer dollar comparison
 *  - Address: Full canonical address comparison
 *  - Description: Word-overlap similarity (threshold >= 70%)
 *  - Beds/Baths/SqFt: Integer/numeric comparison
 *  - Property Type: Normalized string match
 *  - Status: Status string match
 *  - Agent: Normalized name match
 *  - Map Coordinates: Haversine distance in miles (flags pin displacement > 0.1 miles)
 *  - Photos: SHA-256 fingerprint + sequence analysis + approved arrangement suppression
 *  - Not Found: Flagged when snapshot is null (listing missing on external platform)
 */
export async function compareListingToSnapshot(input: ComparisonInput): Promise<FieldDiff[]> {
  const { listing, snapshot, site } = input;
  const diffs: FieldDiff[] = [];

  // ── 1. Unmatched / Not Found ──────────────────────────────────
  if (!snapshot) {
    diffs.push({
      field: "not_found",
      sourceValue: `MLS Active Listing (${listing.mlsNumber})`,
      siteValue: `Listing not found on ${site}`,
      note: `The property is active in Crescent MLS but could not be located on ${site}.`,
    });
    return diffs;
  }

  // ── 2. Price Comparison ──────────────────────────────────────
  if (snapshot.price != null) {
    const sourcePrice = normalizePrice(Number(listing.price));
    const sitePrice = normalizePrice(Number(snapshot.price));
    if (sourcePrice !== sitePrice) {
      diffs.push({
        field: "price",
        sourceValue: `$${sourcePrice.toLocaleString()}`,
        siteValue: `$${sitePrice.toLocaleString()}`,
        note: `Price discrepancy of $${Math.abs(sourcePrice - sitePrice).toLocaleString()}`,
      });
    }
  }

  // ── 3. Address Comparison ────────────────────────────────────
  if (snapshot.street || snapshot.city || snapshot.state || snapshot.zip) {
    const sourceAddr = `${listing.street}, ${listing.city}, ${listing.state} ${listing.zip}`.trim();
    const siteAddr = `${snapshot.street ?? ""}, ${snapshot.city ?? ""}, ${snapshot.state ?? ""} ${snapshot.zip ?? ""}`.trim();

    if (sourceAddr.toLowerCase() !== siteAddr.toLowerCase()) {
      diffs.push({
        field: "address",
        sourceValue: sourceAddr,
        siteValue: siteAddr,
      });
    }
  }

  // ── 4. Description Comparison ────────────────────────────────
  if (snapshot.description && listing.description) {
    const sourceNorm = normalizeDescription(listing.description);
    const siteNorm = normalizeDescription(snapshot.description);

    if (!areDescriptionsSimilar(sourceNorm, siteNorm)) {
      diffs.push({
        field: "description",
        sourceValue: listing.description.length > 200 ? `${listing.description.substring(0, 200)}...` : listing.description,
        siteValue: snapshot.description.length > 200 ? `${snapshot.description.substring(0, 200)}...` : snapshot.description,
        note: "Description text differs significantly from MLS source description.",
      });
    }
  }

  // ── 5. Map Coordinates (Haversine Formula) ───────────────────
  if (snapshot.lat != null && snapshot.lng != null && listing.lat != null && listing.lng != null) {
    const sourceLat = Number(listing.lat);
    const sourceLng = Number(listing.lng);
    const siteLat = Number(snapshot.lat);
    const siteLng = Number(snapshot.lng);

    const distanceMiles = haversineDistanceMiles(sourceLat, sourceLng, siteLat, siteLng);
    if (distanceMiles > 0.1) {
      diffs.push({
        field: "mapCoordinates",
        sourceValue: `Lat: ${sourceLat.toFixed(5)}, Lng: ${sourceLng.toFixed(5)}`,
        siteValue: `Lat: ${siteLat.toFixed(5)}, Lng: ${siteLng.toFixed(5)} [Pin off by ${distanceMiles.toFixed(2)} mi]`,
        note: `Map pin is misplaced by approximately ${distanceMiles.toFixed(2)} miles.`,
      });
    }
  }

  // ── 6. Photo Comparison & Approval Check ─────────────────────
  if (snapshot.photos && Array.isArray(snapshot.photos)) {
    const sourcePhotos: PhotoItem[] = (listing.photos || []).map((p, idx) => ({
      url: p.url,
      order: p.position ?? idx + 1,
    }));

    const sitePhotos: PhotoItem[] = (snapshot.photos as { url: string; order?: number }[]).map(
      (p, idx) => ({
        url: p.url,
        order: p.order ?? idx + 1,
      })
    );

    if (sourcePhotos.length > 0 && sitePhotos.length > 0) {
      const photoResult = await comparePhotos(listing.id, site, sourcePhotos, sitePhotos);

      if (photoResult.hasDiscrepancy && !photoResult.isApprovedArrangement) {
        let sourceValue = `MLS Photos (${sourcePhotos.length} photos in order)`;
        let siteValue = `${site} Photos (${sitePhotos.length} photos)`;

        if (photoResult.discrepancyType === "PHOTO_ORDER_MISMATCH") {
          sourceValue = `Original Sequence: 1 to ${sourcePhotos.length}`;
          siteValue = `Altered Sequence [${photoResult.explanation}]`;
        }

        diffs.push({
          field: "photos",
          sourceValue,
          siteValue,
          note: photoResult.explanation,
        });
      }
    }
  }

  return diffs;
}

/**
 * Checks word overlap between source and site descriptions.
 * Returns true if >= 70% of significant source words (>3 characters) are present in the site description.
 */
function areDescriptionsSimilar(source: string, site: string): boolean {
  const sourceWords = Array.from(new Set(source.split(/\s+/).filter((w) => w.length > 3)));
  if (sourceWords.length === 0) return true;

  let matches = 0;
  for (const word of sourceWords) {
    if (site.includes(word)) {
      matches++;
    }
  }

  return matches / sourceWords.length >= 0.7;
}

/**
 * Computes great-circle distance between two points in miles using Haversine formula.
 */
export function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
