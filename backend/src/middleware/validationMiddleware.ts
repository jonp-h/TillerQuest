// lib/validationMiddleware.ts
import { prettifyError, z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ErrorMessage } from "../lib/error.js";

export const validateBody = <T extends z.ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ErrorMessage(prettifyError(result.error) || "Invalid input");
    }

    // Attach validated data to request
    req.body = result.data;
    next();
  };
};

export const validateQuery = <T extends z.ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw new ErrorMessage(
        prettifyError(result.error) || "Invalid query parameters",
      );
    }
    // Attach validated data to request
    (req as any).validatedQuery = result.data;
    next();
  };
};

export const validateParams = <T extends z.ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      throw new ErrorMessage(
        prettifyError(result.error) || "Invalid parameters",
      );
    }

    // Attach validated data to request
    req.params = result.data as any;
    next();
  };
};
