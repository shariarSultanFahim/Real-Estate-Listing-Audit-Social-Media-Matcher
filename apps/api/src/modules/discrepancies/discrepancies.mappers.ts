import {
  Discrepancy as PrismaDiscrepancy,
} from "@prisma/client";
import { Discrepancy } from "@real-estate/types";

export function mapDiscrepancy(row: PrismaDiscrepancy): Discrepancy {
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
    note: row.note ?? undefined,
  };
}

export function mapDiscrepancies(rows: PrismaDiscrepancy[]): Discrepancy[] {
  return rows.map(mapDiscrepancy);
}
