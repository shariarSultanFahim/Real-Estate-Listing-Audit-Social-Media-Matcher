import { Router, Request, Response, NextFunction } from "express";
import * as discrepanciesService from "./discrepancies.service";
import { requirePermission } from "../../middleware/auth";

export const discrepanciesRouter: Router = Router();

// GET /discrepancies?listingId=&includeResolved=&site=&field=
discrepanciesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = req.query.listingId ? String(req.query.listingId) : undefined;
    const site = req.query.site ? String(req.query.site) : undefined;
    const field = req.query.field ? String(req.query.field) : undefined;
    const includeResolved = req.query.includeResolved === "true";

    const discrepancies = await discrepanciesService.findAll({
      listingId,
      site,
      field,
      includeResolved,
    });
    res.json(discrepancies);
  } catch (err) {
    next(err);
  }
});

// GET /discrepancies/:id
discrepanciesRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discrepancy = await discrepanciesService.findById(String(req.params.id));
    res.json(discrepancy);
  } catch (err) {
    next(err);
  }
});

// GET /discrepancies/:id/history — fetch immutable status history
discrepanciesRouter.get("/:id/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await discrepanciesService.getHistory(String(req.params.id));
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// POST /discrepancies/:id/notes — add a staff note to a discrepancy
discrepanciesRouter.post(
  "/:id/notes",
  requirePermission("discrepancies:resolve"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content } = req.body as { content?: string };
      if (!content || !content.trim()) {
        res.status(400).json({ success: false, error: "Note content is required" });
        return;
      }

      const authorId = req.user?.id || (req.body.authorId as string) || null;
      const note = await discrepanciesService.addNote(String(req.params.id), authorId, content.trim());
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  }
);

// POST /discrepancies/:id/approve-photo-arrangement — approve an external photo arrangement
discrepanciesRouter.post(
  "/:id/approve-photo-arrangement",
  requirePermission("discrepancies:resolve"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notes } = req.body as { notes?: string };
      const approvedBy = req.user?.id || (req.body.approvedBy as string) || null;

      const updated = await discrepanciesService.approvePhotoDiscrepancy(
        String(req.params.id),
        approvedBy || undefined,
        notes
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /discrepancies — update status and/or note (matches frontend useMutation payload)
discrepanciesRouter.patch(
  "/",
  requirePermission("discrepancies:resolve"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, status, note, changedBy } = req.body as {
        id: string;
        status?: any;
        note?: string;
        changedBy?: string;
      };

      if (!id) {
        res.status(400).json({ success: false, error: "id is required" });
        return;
      }

      const userId = req.user?.id || changedBy;
      const updated = await discrepanciesService.update({
        id,
        status,
        note,
        changedBy: userId,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);
