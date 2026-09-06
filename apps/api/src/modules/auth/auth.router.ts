import { Router, Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { requireAuth } from "../../middleware/auth";

export const authRouter: Router = Router();

// POST /auth/login
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" });
      return;
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /auth/me — returns current authenticated user profile
authRouter.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const user = await authService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /auth/refresh — re-generates token for active user
authRouter.post("/refresh", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const user = await authService.getProfile(req.user.id);
    const token = authService.generateToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});
