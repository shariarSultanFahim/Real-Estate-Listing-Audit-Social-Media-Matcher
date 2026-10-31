import { Router, Request, Response, NextFunction } from "express";
import * as listingsService from "./listings.service";
import * as listingsImportService from "./listings-import.service";

export const listingsRouter: Router = Router();

// GET /listings/template - Download sample CSV or XLSX template
listingsRouter.get("/template", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const format = req.query.format === "xlsx" ? "xlsx" : "csv";
    const buffer = listingsImportService.generateTemplate(format);
    const contentType =
      format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";
    const filename = `Brokerage_Engine_Listings_Template.${format}`;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

// POST /listings/import - Bulk upload listings from Excel, CSV, or JSON
listingsRouter.post("/import", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let rows: any[] = [];
    const autoResolveSold = req.body?.autoResolveSold !== false;

    if (req.body?.fileBase64) {
      const buffer = Buffer.from(req.body.fileBase64, "base64");
      rows = listingsImportService.parseSpreadsheetBuffer(buffer);
    } else if (Array.isArray(req.body?.items)) {
      rows = req.body.items;
    } else if (Array.isArray(req.body)) {
      rows = req.body;
    } else {
      return res.status(400).json({ error: "No items or fileBase64 provided in request body" });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "File contains no listing records" });
    }

    const result = await listingsImportService.bulkImportListings(rows, { autoResolveSold });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /listings
listingsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const listings = await listingsService.findAll();
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

// GET /listings/:id
listingsRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await listingsService.findById(String(req.params.id));
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

// POST /listings
listingsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await listingsService.create(req.body);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
});

// PATCH /listings/:id
listingsRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await listingsService.update(String(req.params.id), req.body);
    res.json(listing);
  } catch (err) {
    next(err);
  }
});
