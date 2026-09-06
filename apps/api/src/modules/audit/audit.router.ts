import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma";
import { executeAuditPipeline } from "../../services/audit-pipeline.service";
import { requirePermission } from "../../middleware/auth";
import { ExternalPlatform } from "@prisma/client";

export const auditRouter: Router = Router();

// GET /audit/runs — list recent audit runs
auditRouter.get("/runs", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const runs = await prisma.auditRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
    });
    res.json(runs);
  } catch (err) {
    next(err);
  }
});

// GET /audit/runs/:id — status & full breakdown of a specific run
auditRouter.get("/runs/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await prisma.auditRun.findUnique({ where: { id: String(req.params.id) } });
    if (!run) {
      res.status(404).json({ success: false, error: "Audit run not found" });
      return;
    }
    res.json(run);
  } catch (err) {
    next(err);
  }
});

// GET /audit/snapshots/:listingId — get latest snapshots for a listing
auditRouter.get("/snapshots/:listingId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snapshots = await prisma.siteSnapshot.findMany({
      where: { listingId: String(req.params.listingId) },
    });
    res.json(snapshots);
  } catch (err) {
    next(err);
  }
});

// GET /audit/snapshots/:listingId/history — view historical snapshots for a listing over time
auditRouter.get("/snapshots/:listingId/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await prisma.siteSnapshotHistory.findMany({
      where: { listingId: String(req.params.listingId) },
      orderBy: { capturedAt: "desc" },
    });
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// POST /audit/run — manually trigger a full or platform-specific audit cycle
auditRouter.post(
  "/run",
  requirePermission("listings:create"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as {
        triggeredBy?: string;
        platform?: ExternalPlatform;
        listingId?: string;
        dryRun?: boolean;
      };

      const triggeredBy = req.user?.name || req.user?.email || body.triggeredBy || "manual-staff";

      const result = await executeAuditPipeline({
        triggeredBy,
        platform: body.platform,
        listingId: body.listingId,
        dryRun: body.dryRun,
      });

      res.status(200).json({
        success: true,
        runId: result.auditRunId,
        status: result.status,
        listingsProcessed: result.listingsProcessed,
        listingsMatched: result.listingsMatched,
        listingsUnmatched: result.listingsUnmatched,
        discrepanciesFound: result.discrepanciesFound,
        discrepanciesCreated: result.discrepanciesCreated,
        platformResults: result.platformResults,
        errors: result.errors,
      });
    } catch (err) {
      next(err);
    }
  }
);
