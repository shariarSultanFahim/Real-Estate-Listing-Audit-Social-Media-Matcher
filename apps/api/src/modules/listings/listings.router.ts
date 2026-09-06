import { Router, Request, Response, NextFunction } from "express";
import * as listingsService from "./listings.service";

export const listingsRouter: Router = Router();

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
