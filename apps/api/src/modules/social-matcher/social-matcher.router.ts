import { Router, Request, Response, NextFunction } from "express";
import * as socialMatcherService from "./social-matcher.service";

export const socialMatcherRouter: Router = Router();

// POST /social-matcher
// Body: { city: string, price: number, state?: string }
socialMatcherRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, price, state } = req.body as {
      city: string;
      price: number;
      state?: string;
    };

    if (!city || typeof price !== "number") {
      res.status(400).json({ success: false, error: "city and price are required" });
      return;
    }

    const results = await socialMatcherService.matchAgents({ city, price, state });
    res.json(results);
  } catch (err) {
    next(err);
  }
});
