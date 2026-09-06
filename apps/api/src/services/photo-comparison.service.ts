import crypto from "crypto";
import { prisma } from "../prisma";
import { SyndicationSite } from "@prisma/client";

export interface PhotoItem {
  url: string;
  order?: number;
  caption?: string;
}

export type PhotoDiscrepancyType =
  | "PHOTO_ORDER_MISMATCH"
  | "MISSING_PHOTOS"
  | "NEW_PHOTOS"
  | "DIFFERENT_PHOTOS"
  | "NO_DIFFERENCE";

export interface PhotoComparisonResult {
  hasDiscrepancy: boolean;
  discrepancyType: PhotoDiscrepancyType;
  isApprovedArrangement: boolean;
  sourceFingerprint: string;
  siteFingerprint: string;
  sourcePhotoCount: number;
  sitePhotoCount: number;
  explanation: string;
}

/**
 * Normalizes photo URL to a canonical identity string (stripping query parameters, trailing slashes)
 */
export function normalizePhotoUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Keep pathname lowercase and without trailing slash
    const cleanPath = parsed.pathname.toLowerCase().replace(/\/$/, "");
    return `${parsed.host.toLowerCase()}${cleanPath}`;
  } catch {
    // If not a valid URL, fallback to trimmed string
    return url.trim().toLowerCase();
  }
}

/**
 * Generates a deterministic SHA-256 fingerprint for an ordered list of photos.
 * Output is stable and reproducible.
 */
export function computePhotoFingerprint(photos: (PhotoItem | string)[]): string {
  const normalizedUrls = photos.map((p) =>
    typeof p === "string" ? normalizePhotoUrl(p) : normalizePhotoUrl(p.url)
  );

  const hash = crypto.createHash("sha256");
  hash.update(normalizedUrls.join("||"));
  return hash.digest("hex");
}

/**
 * Generates an unordered set fingerprint to check if the exact same set of photos
 * exists regardless of ordering.
 */
export function computeUnorderedSetFingerprint(photos: (PhotoItem | string)[]): string {
  const normalizedUrls = photos
    .map((p) => (typeof p === "string" ? normalizePhotoUrl(p) : normalizePhotoUrl(p.url)))
    .sort();

  const hash = crypto.createHash("sha256");
  hash.update(normalizedUrls.join("||"));
  return hash.digest("hex");
}

/**
 * Compares source photos (SoT) against site photos.
 * Checks whether an arrangement difference has already been approved by staff.
 */
export async function comparePhotos(
  listingId: string,
  site: SyndicationSite,
  sourcePhotos: (PhotoItem | string)[],
  sitePhotos: (PhotoItem | string)[],
  opts: { approvedFingerprints?: string[] } = {}
): Promise<PhotoComparisonResult> {
  const sourceNormalized = sourcePhotos.map((p) =>
    typeof p === "string" ? normalizePhotoUrl(p) : normalizePhotoUrl(p.url)
  );
  const siteNormalized = sitePhotos.map((p) =>
    typeof p === "string" ? normalizePhotoUrl(p) : normalizePhotoUrl(p.url)
  );

  const sourceFingerprint = computePhotoFingerprint(sourcePhotos);
  const siteFingerprint = computePhotoFingerprint(sitePhotos);

  // 1. Identical ordered photos
  if (sourceFingerprint === siteFingerprint) {
    return {
      hasDiscrepancy: false,
      discrepancyType: "NO_DIFFERENCE",
      isApprovedArrangement: false,
      sourceFingerprint,
      siteFingerprint,
      sourcePhotoCount: sourcePhotos.length,
      sitePhotoCount: sitePhotos.length,
      explanation: "Photos match exactly in content and order",
    };
  }

  // 2. Check if the site's fingerprint has already been approved by staff
  let isApproved = opts.approvedFingerprints?.includes(siteFingerprint) ?? false;
  if (!isApproved && process.env.NODE_ENV !== "test") {
    try {
      const approved = await prisma.approvedPhotoArrangement.findUnique({
        where: {
          listingId_site_fingerprint: {
            listingId,
            site,
            fingerprint: siteFingerprint,
          },
        },
      });
      if (approved) {
        isApproved = true;
      }
    } catch {
      // In isolated environments, treat as unapproved
    }
  }

  if (isApproved) {
    return {
      hasDiscrepancy: false,
      discrepancyType: "PHOTO_ORDER_MISMATCH",
      isApprovedArrangement: true,
      sourceFingerprint,
      siteFingerprint,
      sourcePhotoCount: sourcePhotos.length,
      sitePhotoCount: sitePhotos.length,
      explanation: "Photo arrangement differs from MLS source but was explicitly approved by staff.",
    };
  }

  // 3. Analyze differences
  const sourceSet = new Set(sourceNormalized);
  const siteSet = new Set(siteNormalized);

  const missingFromSite = sourceNormalized.filter((url) => !siteSet.has(url));
  const newOnSite = siteNormalized.filter((url) => !sourceSet.has(url));

  const sourceUnorderedHash = computeUnorderedSetFingerprint(sourcePhotos);
  const siteUnorderedHash = computeUnorderedSetFingerprint(sitePhotos);

  // Case A: Same set of photos, just different ordering
  if (sourceUnorderedHash === siteUnorderedHash) {
    return {
      hasDiscrepancy: true,
      discrepancyType: "PHOTO_ORDER_MISMATCH",
      isApprovedArrangement: false,
      sourceFingerprint,
      siteFingerprint,
      sourcePhotoCount: sourcePhotos.length,
      sitePhotoCount: sitePhotos.length,
      explanation: `Photo order mismatch: Same ${sourcePhotos.length} photos displayed in different sequence.`,
    };
  }

  // Case B: Photos missing from site
  if (missingFromSite.length > 0 && newOnSite.length === 0) {
    return {
      hasDiscrepancy: true,
      discrepancyType: "MISSING_PHOTOS",
      isApprovedArrangement: false,
      sourceFingerprint,
      siteFingerprint,
      sourcePhotoCount: sourcePhotos.length,
      sitePhotoCount: sitePhotos.length,
      explanation: `Missing photos: ${missingFromSite.length} MLS photo(s) missing on ${site} (${sitePhotos.length}/${sourcePhotos.length} present).`,
    };
  }

  // Case C: New/extra photos on site
  if (newOnSite.length > 0 && missingFromSite.length === 0) {
    return {
      hasDiscrepancy: true,
      discrepancyType: "NEW_PHOTOS",
      isApprovedArrangement: false,
      sourceFingerprint,
      siteFingerprint,
      sourcePhotoCount: sourcePhotos.length,
      sitePhotoCount: sitePhotos.length,
      explanation: `Extra photos: ${site} displays ${newOnSite.length} photo(s) not found in MLS source.`,
    };
  }

  // Case D: Different photos
  return {
    hasDiscrepancy: true,
    discrepancyType: "DIFFERENT_PHOTOS",
    isApprovedArrangement: false,
    sourceFingerprint,
    siteFingerprint,
    sourcePhotoCount: sourcePhotos.length,
    sitePhotoCount: sitePhotos.length,
    explanation: `Different photo set: ${missingFromSite.length} missing and ${newOnSite.length} unexpected photo(s).`,
  };
}

/**
 * Staff approves a photo arrangement for a listing on a specific site.
 */
export async function approvePhotoArrangement(
  listingId: string,
  site: SyndicationSite,
  sitePhotos: (PhotoItem | string)[],
  approvedBy?: string,
  notes?: string
) {
  const fingerprint = computePhotoFingerprint(sitePhotos);
  const photoUrls = sitePhotos.map((p) => (typeof p === "string" ? p : p.url));

  return prisma.approvedPhotoArrangement.upsert({
    where: {
      listingId_site_fingerprint: {
        listingId,
        site,
        fingerprint,
      },
    },
    update: {
      approvedAt: new Date(),
      approvedBy,
      notes,
      photoCount: photoUrls.length,
      photoUrls,
    },
    create: {
      listingId,
      site,
      fingerprint,
      photoCount: photoUrls.length,
      photoUrls,
      approvedBy,
      notes,
    },
  });
}
