import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";

type Schemas = {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
};

export const validateRequest =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      // body pe reassign generally safe hai
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body);
        req.body = parsedBody;
      }

      // ❌ req.query = ...  nahi karna
      // ✅ object ko mutate karo
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);

        // Purane keys clear karo
        Object.keys(req.query).forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (req.query as any)[key];
        });

        // Naye parsed values copy karo
        Object.assign(req.query as any, parsedQuery);
      }

      // same params ke liye – reassign se bachne ke liye mutate
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);

        Object.keys(req.params).forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (req.params as any)[key];
        });

        Object.assign(req.params as any, parsedParams);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));
        return next(new ApiError(400, "Validation error", details));
      }
      next(error);
    }
  };
