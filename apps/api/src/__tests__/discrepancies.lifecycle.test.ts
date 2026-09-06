import { describe, it, expect } from "vitest";

describe("Discrepancy Lifecycle & State Rules", () => {
  // Test the core state transition and idempotency logic in isolation
  type DiscrepancyStatus = "open" | "in_progress" | "resolved" | "ignored";

  interface DiscrepancyRecord {
    id: string;
    listingId: string;
    site: string;
    field: string;
    sourceValue: string;
    siteValue: string;
    status: DiscrepancyStatus;
    active: boolean;
    resolvedAt?: Date | null;
    note?: string;
  }

  interface HistoryRecord {
    discrepancyId: string;
    action: string;
    fromStatus: DiscrepancyStatus | null;
    toStatus: DiscrepancyStatus;
    note?: string;
    changedAt: Date;
  }

  function simulateCreateOrUpdate(
    existing: DiscrepancyRecord | null,
    input: {
      listingId: string;
      site: string;
      field: string;
      sourceValue: string;
      siteValue: string;
      note?: string;
    }
  ): { discrepancy: DiscrepancyRecord; historyEvent?: HistoryRecord } {
    if (existing && existing.active) {
      // Active discrepancy exists: idempotent update of values
      return {
        discrepancy: {
          ...existing,
          sourceValue: input.sourceValue,
          siteValue: input.siteValue,
          note: input.note !== undefined ? input.note : existing.note,
        },
      };
    }

    if (existing && !existing.active) {
      // Resolved/ignored discrepancy reopened on audit
      return {
        discrepancy: {
          ...existing,
          status: "open",
          active: true,
          resolvedAt: null,
          sourceValue: input.sourceValue,
          siteValue: input.siteValue,
          note: input.note ?? existing.note,
        },
        historyEvent: {
          discrepancyId: existing.id,
          action: "reopened",
          fromStatus: existing.status,
          toStatus: "open",
          note: "Mismatch re-detected during automated audit cycle.",
          changedAt: new Date(),
        },
      };
    }

    // New discrepancy
    const newId = `disc-${Date.now()}`;
    return {
      discrepancy: {
        id: newId,
        listingId: input.listingId,
        site: input.site,
        field: input.field,
        sourceValue: input.sourceValue,
        siteValue: input.siteValue,
        status: "open",
        active: true,
        resolvedAt: null,
        note: input.note,
      },
      historyEvent: {
        discrepancyId: newId,
        action: "status_change",
        fromStatus: null,
        toStatus: "open",
        note: "Discrepancy detected during automated audit.",
        changedAt: new Date(),
      },
    };
  }

  it("creates an initial open discrepancy with status_change history", () => {
    const { discrepancy, historyEvent } = simulateCreateOrUpdate(null, {
      listingId: "list-101",
      site: "zillow",
      field: "price",
      sourceValue: "$485,000",
      siteValue: "$510,000",
    });

    expect(discrepancy.status).toBe("open");
    expect(discrepancy.active).toBe(true);
    expect(historyEvent?.action).toBe("status_change");
    expect(historyEvent?.toStatus).toBe("open");
  });

  it("updates existing active discrepancy idempotently without duplicate records", () => {
    const initial: DiscrepancyRecord = {
      id: "disc-1",
      listingId: "list-101",
      site: "zillow",
      field: "price",
      sourceValue: "$485,000",
      siteValue: "$510,000",
      status: "open",
      active: true,
    };

    const { discrepancy, historyEvent } = simulateCreateOrUpdate(initial, {
      listingId: "list-101",
      site: "zillow",
      field: "price",
      sourceValue: "$485,000",
      siteValue: "$515,000", // price changed on external site
    });

    expect(discrepancy.id).toBe("disc-1");
    expect(discrepancy.siteValue).toBe("$515,000");
    expect(discrepancy.active).toBe(true);
    expect(historyEvent).toBeUndefined(); // no extra history on simple value refresh
  });

  it("reopens a resolved discrepancy when the mismatch reappears on subsequent audit", () => {
    const resolved: DiscrepancyRecord = {
      id: "disc-2",
      listingId: "list-101",
      site: "zillow",
      field: "price",
      sourceValue: "$485,000",
      siteValue: "$485,000",
      status: "resolved",
      active: false,
      resolvedAt: new Date("2026-08-01"),
    };

    const { discrepancy, historyEvent } = simulateCreateOrUpdate(resolved, {
      listingId: "list-101",
      site: "zillow",
      field: "price",
      sourceValue: "$485,000",
      siteValue: "$520,000", // mismatch reappeared!
    });

    expect(discrepancy.id).toBe("disc-2");
    expect(discrepancy.status).toBe("open");
    expect(discrepancy.active).toBe(true);
    expect(discrepancy.resolvedAt).toBeNull();
    expect(historyEvent?.action).toBe("reopened");
    expect(historyEvent?.fromStatus).toBe("resolved");
    expect(historyEvent?.toStatus).toBe("open");
  });
});
