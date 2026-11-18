import {
  Discrepancy as PrismaDiscrepancy,
} from "@prisma/client";
import { Discrepancy } from "@real-estate/types";

export function mapDiscrepancy(
  row: PrismaDiscrepancy & {
    notes?: Array<{ content: string; createdAt: Date }>;
    history?: Array<{ action: any; toStatus: any; note: string | null; changedAt: Date }>;
  }
): Discrepancy {
  // Use most recent note from notes array if available, otherwise fallback to row.note
  const latestNote = row.notes && row.notes.length > 0 ? row.notes[0].content : (row.note ?? undefined);

  // Find explicit resolution note from history if marked resolved
  const resHistory = row.history?.find(
    (h) => (h.toStatus === "resolved" || h.action === "manual_resolution") && h.note
  );
  const resolutionNote =
    resHistory?.note ??
    (row.status === "resolved" || !row.active ? (row.note ?? latestNote) : undefined);

  return {
    id: row.id,
    listingId: row.listingId,
    site: row.site as Discrepancy["site"],
    field: row.field as Discrepancy["field"],
    sourceValue: row.sourceValue,
    siteValue: row.siteValue,
    status: row.status as Discrepancy["status"],
    detectedAt: row.detectedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? undefined,
    note: latestNote,
    resolutionNote,
  };
}

export function mapDiscrepancies(
  rows: Array<
    PrismaDiscrepancy & {
      notes?: Array<{ content: string; createdAt: Date }>;
      history?: Array<{ action: any; toStatus: any; note: string | null; changedAt: Date }>;
    }
  >
): Discrepancy[] {
  return rows.map(mapDiscrepancy);
}
