/**
 * Validation Middleware
 */

import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { validationErrorResponse } from "./response.middleware.js";

// Extend Hono Context type to include validated data
declare module "hono" {
  interface ContextVariableMap {
    validatedBody: unknown;
    validatedQuery: unknown;
  }
}

/**
 * Middleware to validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set("validatedBody", validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return c.json(validationErrorResponse(errors), 400);
      }
      return c.json(validationErrorResponse("Invalid request body"), 400);
    }
  };
}

/**
 * Middleware to validate query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      c.set("validatedQuery", validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return c.json(validationErrorResponse(errors), 400);
      }
      return c.json(validationErrorResponse("Invalid query parameters"), 400);
    }
  };
}
