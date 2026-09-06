import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { createError } from "./errorHandler";
import { AccountType } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware: Verifies Bearer JWT token and attaches user payload to req.user.
 * In development, if no Authorization header is provided, it can allow requests
 * or fallback gracefully.
 */
export function authenticateJwt(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    next(createError("Invalid or expired authentication token", 401));
  }
}

/**
 * Middleware: Enforces that the request has a valid authenticated user.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(createError("Authentication required to access this resource", 401));
  }
  next();
}

/**
 * Middleware: Enforces specific permission check (or superAdmin bypass).
 */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      // In development mode without auth header, log warning and allow for easy local prototyping
      if (config.NODE_ENV === "development") {
        return next();
      }
      return next(createError("Authentication required", 401));
    }

    if (req.user.accountType === "superAdmin") {
      return next();
    }

    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    next(createError(`Forbidden: Missing required permission '${permission}'`, 403));
  };
}
