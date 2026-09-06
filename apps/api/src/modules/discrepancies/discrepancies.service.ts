import { prisma } from "../../prisma";
import { createError } from "../../middleware/errorHandler";
import { mapDiscrepancy, mapDiscrepancies } from "./discrepancies.mappers";
import { Discrepancy } from "@real-estate/types";
import { DiscrepancyField, DiscrepancyStatus, SyndicationSite, Prisma } from "@prisma/client";
import { approvePhotoArrangement } from "../../services/photo-comparison.service";

export interface FindDiscrepanciesOptions {
  listingId?: string;
  site?: string;
  field?: string;
  includeResolved?: boolean;
}

export async function findAll(opts: FindDiscrepanciesOptions = {}): Promise<Discrepancy[]> {
  const rows = await prisma.discrepancy.findMany({
    where: {
      ...(opts.listingId ? { listingId: opts.listingId } : {}),
      ...(opts.site ? { site: opts.site as SyndicationSite } : {}),
      ...(opts.field ? { field: opts.field as DiscrepancyField } : {}),
      ...(opts.includeResolved ? {} : { active: true }),
    },
    orderBy: { detectedAt: "desc" },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  return mapDiscrepancies(rows);
}

export async function findById(id: string): Promise<Discrepancy> {
  const row = await prisma.discrepancy.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      history: { orderBy: { changedAt: "desc" } },
    },
  });
  if (!row) throw createError(`Discrepancy ${id} not found`, 404);
  return mapDiscrepancy(row);
}

export interface UpdateDiscrepancyInput {
  id: string;
  status?: DiscrepancyStatus;
  note?: string;
  changedBy?: string; // User ID
}

/**
 * Updates a discrepancy status and/or appends a note.
 * Runs atomically in a transaction:
 * - Appends immutable history record with action classification.
 * - Sets resolvedAt when resolved.
 * - Sets active=false when resolved or ignored.
 * - Re-activates when moved to open or in_progress.
 */
export async function update(input: UpdateDiscrepancyInput): Promise<Discrepancy> {
  const existing = await prisma.discrepancy.findUnique({ where: { id: input.id } });
  if (!existing) throw createError(`Discrepancy ${input.id} not found`, 404);

  const statusChanged = input.status && input.status !== existing.status;
  const isResolvedOrIgnored = input.status === "resolved" || input.status === "ignored";

  const actionType =
    input.status === "ignored"
      ? "ignored"
      : input.status === "resolved"
        ? "manual_resolution"
        : "status_change";

  const [updated] = await prisma.$transaction([
    prisma.discrepancy.update({
      where: { id: input.id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(isResolvedOrIgnored
          ? { active: false, resolvedAt: input.status === "resolved" ? new Date() : null }
          : input.status
            ? { active: true, resolvedAt: null }
            : {}),
      },
    }),

    // Immutable audit history record
    ...(statusChanged
      ? [
          prisma.discrepancyHistory.create({
            data: {
              discrepancyId: input.id,
              changedBy: input.changedBy ?? null,
              action: actionType as any,
              fromStatus: existing.status,
              toStatus: input.status!,
              note: input.note ?? null,
            },
          }),
        ]
      : []),

    // Add persistent staff note if provided
    ...(input.note
      ? [
          prisma.discrepancyNote.create({
            data: {
              discrepancyId: input.id,
              authorId: input.changedBy ?? null,
              content: input.note,
            },
          }),
        ]
      : []),
  ]);

  return mapDiscrepancy(updated);
}

/**
 * Appends a staff note to a discrepancy without altering its status.
 */
export async function addNote(discrepancyId: string, authorId: string | null, content: string) {
  const existing = await prisma.discrepancy.findUnique({ where: { id: discrepancyId } });
  if (!existing) throw createError(`Discrepancy ${discrepancyId} not found`, 404);

  const [note] = await prisma.$transaction([
    prisma.discrepancyNote.create({
      data: {
        discrepancyId,
        authorId,
        content,
      },
    }),
    prisma.discrepancyHistory.create({
      data: {
        discrepancyId,
        changedBy: authorId,
        action: "note_added",
        fromStatus: existing.status,
        toStatus: existing.status,
        note: content,
      },
    }),
  ]);

  return note;
}

/**
 * Returns the immutable audit history for a discrepancy.
 */
export async function getHistory(discrepancyId: string) {
  const history = await prisma.discrepancyHistory.findMany({
    where: { discrepancyId },
    orderBy: { changedAt: "desc" },
  });
  return history;
}

export interface CreateDiscrepancyInput {
  listingId: string;
  site: SyndicationSite | string;
  field: DiscrepancyField | string;
  sourceValue: string;
  siteValue: string;
  note?: string;
}

/**
 * Idempotent Discrepancy Persistence:
 * - If active discrepancy exists for (listingId, site, field): updates siteValue & sourceValue.
 * - If resolved/ignored discrepancy exists and mismatch reappeared: reopens to "open", sets active=true, records "reopened" history.
 * - If new: creates fresh record with "open" status and records creation history.
 */
export async function createOrUpdate(input: CreateDiscrepancyInput): Promise<Discrepancy> {
  const existing = await prisma.discrepancy.findFirst({
    where: {
      listingId: input.listingId,
      site: input.site as SyndicationSite,
      field: input.field as DiscrepancyField,
    },
    orderBy: { detectedAt: "desc" },
  });

  // Case 1: Active discrepancy already exists -> update values idempotently
  if (existing && existing.active) {
    const updated = await prisma.discrepancy.update({
      where: { id: existing.id },
      data: {
        siteValue: input.siteValue,
        sourceValue: input.sourceValue,
        note: input.note !== undefined ? input.note : existing.note,
      },
    });
    return mapDiscrepancy(updated);
  }

  // Case 2: Resolved or ignored discrepancy reappeared -> reopen it
  if (existing && !existing.active) {
    const [reopened] = await prisma.$transaction([
      prisma.discrepancy.update({
        where: { id: existing.id },
        data: {
          status: "open",
          active: true,
          resolvedAt: null,
          sourceValue: input.sourceValue,
          siteValue: input.siteValue,
          note: input.note ?? existing.note,
          detectedAt: new Date(),
        },
      }),
      prisma.discrepancyHistory.create({
        data: {
          discrepancyId: existing.id,
          action: "reopened",
          fromStatus: existing.status,
          toStatus: "open",
          note: "Mismatch re-detected during automated audit cycle.",
        },
      }),
    ]);
    return mapDiscrepancy(reopened);
  }

  // Case 3: Brand new discrepancy
  const created = await prisma.discrepancy.create({
    data: {
      listingId: input.listingId,
      site: input.site as SyndicationSite,
      field: input.field as DiscrepancyField,
      sourceValue: input.sourceValue,
      siteValue: input.siteValue,
      status: "open",
      note: input.note,
      active: true,
      history: {
        create: {
          action: "status_change",
          fromStatus: null,
          toStatus: "open",
          note: "Discrepancy detected during automated audit.",
        },
      },
    },
  });

  return mapDiscrepancy(created);
}

/**
 * Approves a photo arrangement and resolves any open photo discrepancy for this listing & platform.
 */
export async function approvePhotoDiscrepancy(
  discrepancyId: string,
  approvedBy?: string,
  notes?: string
) {
  const discrepancy = await prisma.discrepancy.findUnique({
    where: { id: discrepancyId },
  });

  if (!discrepancy) {
    throw createError(`Discrepancy ${discrepancyId} not found`, 404);
  }

  if (discrepancy.field !== "photos") {
    throw createError("Only photo discrepancies can be approved via photo arrangement", 400);
  }

  // Fetch the latest site snapshot to get the photo sequence
  const snapshot = await prisma.siteSnapshot.findUnique({
    where: {
      listingId_site: {
        listingId: discrepancy.listingId,
        site: discrepancy.site,
      },
    },
  });

  if (snapshot && snapshot.photos && Array.isArray(snapshot.photos)) {
    await approvePhotoArrangement(
      discrepancy.listingId,
      discrepancy.site,
      snapshot.photos as { url: string; order?: number }[],
      approvedBy,
      notes || "Staff approved photo arrangement"
    );
  }

  // Mark the discrepancy as resolved with photo_approved action
  const [resolved] = await prisma.$transaction([
    prisma.discrepancy.update({
      where: { id: discrepancyId },
      data: {
        status: "resolved",
        active: false,
        resolvedAt: new Date(),
        note: notes ? `Approved photo arrangement: ${notes}` : "Photo arrangement approved by staff.",
      },
    }),
    prisma.discrepancyHistory.create({
      data: {
        discrepancyId,
        changedBy: approvedBy ?? null,
        action: "photo_approved",
        fromStatus: discrepancy.status,
        toStatus: "resolved",
        note: notes || "Staff approved photo arrangement sequence.",
      },
    }),
  ]);

  return mapDiscrepancy(resolved);
}
