import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";

  if (statusCode === 500) {
    console.error("[ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && err.details
      ? { details: err.details }
      : {}),
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
}

export function createError(message: string, statusCode = 500): ApiError {
  const err = new Error(message) as ApiError;
  err.statusCode = statusCode;
  return err;
}
