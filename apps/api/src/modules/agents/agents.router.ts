import { Router, Request, Response, NextFunction } from "express";
import * as agentsService from "./agents.service";

export const agentsRouter: Router = Router();

// GET /agents
agentsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await agentsService.findAll();
    res.json(agents);
  } catch (err) {
    next(err);
  }
});

// GET /agents/:id
agentsRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentsService.findById(String(req.params.id));
    res.json(agent);
  } catch (err) {
    next(err);
  }
});

// POST /agents
agentsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentsService.create(req.body);
    res.status(201).json(agent);
  } catch (err) {
    next(err);
  }
});

// PATCH /agents/:id
agentsRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentsService.update(String(req.params.id), req.body);
    res.json(agent);
  } catch (err) {
    next(err);
  }
});
