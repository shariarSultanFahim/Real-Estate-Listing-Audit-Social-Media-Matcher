import { prisma } from "../prisma";
import { ExternalPlatform, SyndicationSite, AuditRunStatus, Prisma } from "@prisma/client";
import { scrapeZillow, scrapeRealtor, scrapeLacdb, NormalizedExternalListing } from "../integrations/apify/apify.service";
import { findBestMatch, ExternalListingCandidate } from "./matching.service";
import { compareListingToSnapshot } from "./comparison.service";
import { createOrUpdate } from "../modules/discrepancies/discrepancies.service";

export interface AuditRunOptions {
  triggeredBy?: string;
  platform?: ExternalPlatform;
  listingId?: string;
  dryRun?: boolean;
}

export interface PlatformAuditResult {
  platform: ExternalPlatform;
  site: SyndicationSite;
  success: boolean;
  error?: string;
  candidatesCount: number;
  matchedCount: number;
  unmatchedCount: number;
  discrepanciesCreated: number;
}

export interface FullAuditResult {
  auditRunId: string;
  status: AuditRunStatus;
  startedAt: Date;
  completedAt: Date;
  listingsProcessed: number;
  listingsMatched: number;
  listingsUnmatched: number;
  discrepanciesFound: number;
  discrepanciesCreated: number;
  platformResults: PlatformAuditResult[];
  errors: Array<{ platform: string; message: string; timestamp: string }>;
}

const PLATFORM_TO_SITE: Record<ExternalPlatform, SyndicationSite> = {
  ZILLOW: "zillow",
  REALTOR: "realtor",
  LACDB: "lacdb",
  HOMES: "homes",
  REDFIN: "redfin",
  SOTHEBYS_REALTY: "sothebysRealty",
  CRESCENT_SOTHEBYS: "crescentSothebys",
  MANSIONS_GLOBAL: "mansionsGlobal",
  GOOGLE: "google",
  OTHER: "zillow",
};

/**
 * 9-Stage Audit Pipeline:
 *  1. TRIGGER: Initializes AuditRun record.
 *  2. SCRAPE: Pulls external listings per platform via Apify (or mock/fallback).
 *  3. RAW DATA STORAGE: Stores raw scraped payloads in ExternalListing.
 *  4. NORMALIZE: Standardizes field formats across platforms.
 *  5. MATCH: Evaluates multi-signal confidence scores against MLS listings (SoT).
 *  6. SNAPSHOT: Updates latest SiteSnapshot & archives SiteSnapshotHistory.
 *  7. COMPARE: Performs granular field-by-field and photo fingerprint diffs.
 *  8. DISCREPANCY PERSISTENCE: Idempotently upserts/reopens discrepancies with audit trail.
 *  9. AUDIT COMPLETE: Finalizes AuditRun metrics and status.
 */
export async function executeAuditPipeline(opts: AuditRunOptions = {}): Promise<FullAuditResult> {
  const startedAt = new Date();
  const triggeredBy = opts.triggeredBy ?? "manual";

  // ── Stage 1: TRIGGER ──────────────────────────────────────────
  const auditRun = await prisma.auditRun.create({
    data: {
      triggeredBy,
      platform: opts.platform ?? null,
      status: "running",
      startedAt,
    },
  });

  const errors: Array<{ platform: string; message: string; timestamp: string }> = [];
  const platformResults: PlatformAuditResult[] = [];

  let totalProcessed = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;
  let totalDiscrepanciesFound = 0;
  let totalDiscrepanciesCreated = 0;

  try {
    // Fetch authoritative MLS listings (Source of Truth)
    const listings = await prisma.listing.findMany({
      where: {
        status: "active",
        ...(opts.listingId ? { id: opts.listingId } : {}),
      },
      include: {
        photos: { orderBy: { position: "asc" } },
        listingAgent: true,
      },
    });

    totalProcessed = listings.length;

    // Platforms to audit
    const platformsToRun: ExternalPlatform[] = opts.platform
      ? [opts.platform]
      : ["ZILLOW", "REALTOR", "LACDB"];

    for (const platform of platformsToRun) {
      const site = PLATFORM_TO_SITE[platform] || "zillow";
      const result: PlatformAuditResult = {
        platform,
        site,
        success: true,
        candidatesCount: 0,
        matchedCount: 0,
        unmatchedCount: 0,
        discrepanciesCreated: 0,
      };

      try {
        // ── Stage 2: SCRAPE ───────────────────────────────────────
        let scrapedCandidates: NormalizedExternalListing[] = [];
        let scrapeError: string | undefined = undefined;

        try {
          if (platform === "ZILLOW") {
            // Scrape for listings in the target batch
            for (const listing of listings) {
              const res = await scrapeZillow(listing.street, listing.city, listing.state, listing.zip);
              scrapedCandidates.push(...res);
            }
          } else if (platform === "REALTOR") {
            for (const listing of listings) {
              const res = await scrapeRealtor(listing.street, listing.city, listing.state, listing.zip);
              scrapedCandidates.push(...res);
            }
          } else if (platform === "LACDB") {
            for (const listing of listings) {
              const res = await scrapeLacdb(listing.mlsNumber);
              scrapedCandidates.push(...res);
            }
          }
        } catch (err: any) {
          scrapeError = err.message || "Failed scraping external platform";
          result.success = false;
          result.error = scrapeError;
          errors.push({
            platform,
            message: scrapeError!,
            timestamp: new Date().toISOString(),
          });
        }

        // If scraping failed completely, ISOLATE error: do NOT mark all listings as NOT_FOUND
        if (!result.success) {
          platformResults.push(result);
          continue;
        }

        result.candidatesCount = scrapedCandidates.length;

        // ── Stage 3 & 4: RAW DATA STORAGE & NORMALIZATION ─────────
        const candidateEntities: ExternalListingCandidate[] = [];

        for (const rawCandidate of scrapedCandidates) {
          candidateEntities.push({
            id: rawCandidate.externalId || `ext-${platform.toLowerCase()}-${Date.now()}-${Math.random()}`,
            platform,
            externalId: rawCandidate.externalId,
            address: rawCandidate.address,
            city: rawCandidate.city,
            state: rawCandidate.state,
            zipCode: rawCandidate.zipCode,
            price: rawCandidate.price,
            agentName: rawCandidate.agentName,
            rawData: rawCandidate.rawData,
          });
        }

        // ── Stages 5 to 8: MATCH, SNAPSHOT, COMPARE & PERSIST ─────
        for (const listing of listings) {
          // Stage 5: MATCH
          const bestMatch = findBestMatch(
            {
              mlsNumber: listing.mlsNumber,
              street: listing.street,
              city: listing.city,
              state: listing.state,
              zip: listing.zip,
              price: Number(listing.price),
              agentName: listing.listingAgent?.name,
            },
            candidateEntities
          );

          if (bestMatch) {
            result.matchedCount++;
            totalMatched++;

            const candidate = bestMatch.candidate;

            // Persist raw scrape record into ExternalListing
            await prisma.externalListing.upsert({
              where: {
                listingId_platform: {
                  listingId: listing.id,
                  platform,
                },
              },
              update: {
                externalId: candidate.externalId,
                address: candidate.address,
                city: candidate.city,
                state: candidate.state,
                zipCode: candidate.zipCode,
                price: candidate.price != null ? new Prisma.Decimal(candidate.price) : null,
                agentName: candidate.agentName,
                rawData: (candidate.rawData || {}) as Prisma.InputJsonValue,
                matchConfidence: bestMatch.confidence,
                matchedBy: bestMatch.matchedBy,
                matchingSignals: bestMatch.signals as unknown as Prisma.InputJsonValue,
              },
              create: {
                listingId: listing.id,
                platform,
                externalId: candidate.externalId,
                address: candidate.address,
                city: candidate.city,
                state: candidate.state,
                zipCode: candidate.zipCode,
                price: candidate.price != null ? new Prisma.Decimal(candidate.price) : null,
                agentName: candidate.agentName,
                rawData: (candidate.rawData || {}) as Prisma.InputJsonValue,
                matchConfidence: bestMatch.confidence,
                matchedBy: bestMatch.matchedBy,
                matchingSignals: bestMatch.signals as unknown as Prisma.InputJsonValue,
              },
            });

            // Stage 6: SNAPSHOT (+ SiteSnapshotHistory)
            const snapshotPrice = candidate.price != null ? new Prisma.Decimal(candidate.price) : null;
            const snapshotPhotosJson = (candidate.rawData?.photos as Prisma.InputJsonValue) || [];

            const snapshot = await prisma.siteSnapshot.upsert({
              where: {
                listingId_site: {
                  listingId: listing.id,
                  site,
                },
              },
              update: {
                price: snapshotPrice,
                street: candidate.address,
                city: candidate.city,
                state: candidate.state,
                zip: candidate.zipCode,
                description: (candidate.rawData?.description as string) || null,
                lat: candidate.rawData?.lat ? new Prisma.Decimal(Number(candidate.rawData.lat)) : null,
                lng: candidate.rawData?.lng ? new Prisma.Decimal(Number(candidate.rawData.lng)) : null,
                photos: snapshotPhotosJson,
                sourceUrl: (candidate.rawData?.listingUrl as string) || `https://${site}.com`,
                fetchedAt: new Date(),
              },
              create: {
                listingId: listing.id,
                site,
                price: snapshotPrice,
                street: candidate.address,
                city: candidate.city,
                state: candidate.state,
                zip: candidate.zipCode,
                description: (candidate.rawData?.description as string) || null,
                lat: candidate.rawData?.lat ? new Prisma.Decimal(Number(candidate.rawData.lat)) : null,
                lng: candidate.rawData?.lng ? new Prisma.Decimal(Number(candidate.rawData.lng)) : null,
                photos: snapshotPhotosJson,
                sourceUrl: (candidate.rawData?.listingUrl as string) || `https://${site}.com`,
              },
            });

            // Archive historical external snapshot
            await prisma.siteSnapshotHistory.create({
              data: {
                listingId: listing.id,
                site,
                auditRunId: auditRun.id,
                price: snapshotPrice,
                street: candidate.address,
                city: candidate.city,
                state: candidate.state,
                zip: candidate.zipCode,
                description: (candidate.rawData?.description as string) || null,
                lat: snapshot.lat,
                lng: snapshot.lng,
                photos: snapshotPhotosJson,
                sourceUrl: snapshot.sourceUrl,
              },
            });

            // Stage 7: COMPARE
            const diffs = await compareListingToSnapshot({
              listing,
              snapshot,
              site,
            });

            totalDiscrepanciesFound += diffs.length;

            // Stage 8: DISCREPANCY PERSISTENCE
            for (const diff of diffs) {
              await createOrUpdate({
                listingId: listing.id,
                site,
                field: diff.field,
                sourceValue: diff.sourceValue,
                siteValue: diff.siteValue,
                note: diff.note,
              });
              result.discrepanciesCreated++;
              totalDiscrepanciesCreated++;
            }
          } else {
            // Unmatched / Not Found on this platform (Only if scraper succeeded!)
            result.unmatchedCount++;
            totalUnmatched++;

            if (scrapedCandidates.length > 0) {
              const diffs = await compareListingToSnapshot({
                listing,
                snapshot: null,
                site,
              });

              for (const diff of diffs) {
                await createOrUpdate({
                  listingId: listing.id,
                  site,
                  field: diff.field,
                  sourceValue: diff.sourceValue,
                  siteValue: diff.siteValue,
                  note: diff.note,
                });
                result.discrepanciesCreated++;
                totalDiscrepanciesCreated++;
                totalDiscrepanciesFound++;
              }
            }
          }
        }

        platformResults.push(result);
      } catch (platformErr: any) {
        errors.push({
          platform,
          message: platformErr.message || "Unknown error during platform audit",
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (globalErr: any) {
    errors.push({
      platform: "GLOBAL",
      message: globalErr.message || "Global audit execution failed",
      timestamp: new Date().toISOString(),
    });
  }

  // ── Stage 9: AUDIT COMPLETE ──────────────────────────────────
  const completedAt = new Date();
  let finalStatus: AuditRunStatus = "completed";

  if (errors.length > 0 && platformResults.some((p) => p.success)) {
    finalStatus = "partial";
  } else if (errors.length > 0 && !platformResults.some((p) => p.success)) {
    finalStatus = "failed";
  }

  const updatedRun = await prisma.auditRun.update({
    where: { id: auditRun.id },
    data: {
      status: finalStatus,
      finishedAt: completedAt,
      completedAt: completedAt,
      listingsProcessed: totalProcessed,
      listingsMatched: totalMatched,
      listingsUnmatched: totalUnmatched,
      discrepanciesFound: totalDiscrepanciesFound,
      discrepanciesCreated: totalDiscrepanciesCreated,
      errors: errors as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    auditRunId: updatedRun.id,
    status: finalStatus,
    startedAt,
    completedAt,
    listingsProcessed: totalProcessed,
    listingsMatched: totalMatched,
    listingsUnmatched: totalUnmatched,
    discrepanciesFound: totalDiscrepanciesFound,
    discrepanciesCreated: totalDiscrepanciesCreated,
    platformResults,
    errors,
  };
}
