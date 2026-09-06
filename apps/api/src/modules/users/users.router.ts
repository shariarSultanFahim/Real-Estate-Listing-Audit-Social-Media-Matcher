import { Router, Request, Response, NextFunction } from "express";
import * as usersService from "./users.service";

export const usersRouter: Router = Router();

// GET /users
usersRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /users/:id
usersRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.findById(String(req.params.id));
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /users — create employee
usersRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /users/:id — update employee or profile
usersRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.update(String(req.params.id), req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
