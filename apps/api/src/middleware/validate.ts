import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type RequestPart = "body" | "query" | "params";

export function validate(schema: ZodSchema, part: RequestPart = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: (result.error as ZodError).flatten(),
      });
      return;
    }
    req[part] = result.data;
    next();
  };
}
