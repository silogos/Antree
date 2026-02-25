/**
 * Template Routes
 * API endpoints for template management
 */

import { Hono } from "hono";

import {
  internalErrorResponse,
  notFoundResponse,
  successResponse,
} from "../../middleware/response.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { sseBroadcaster } from "../../sse/broadcaster.js";
import { templateService } from "./template.service.js";
import { createTemplateSchema, createTemplateStatusSchema } from "./template.validator.js";

export const templateRoutes = new Hono();

/**
 * GET /templates
 * Get all templates
 */
templateRoutes.get("/", async (c) => {
  try {
    const templates = await templateService.getAllTemplates();
    return c.json(successResponse(templates, undefined, templates.length));
  } catch (error) {
    console.error("[TemplateRoutes] GET /templates error:", error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /templates/:id
 * Get a single template
 */
templateRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const template = await templateService.getTemplateById(id);

    if (!template) {
      return c.json(notFoundResponse("Template", id), 404);
    }

    return c.json(successResponse(template));
  } catch (error) {
    console.error("[TemplateRoutes] GET /templates/:id error:", error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /templates
 * Create a new template
 */
templateRoutes.post("/", validateBody(createTemplateSchema), async (c) => {
  try {
    const input = c.get("validatedBody") as Parameters<typeof templateService.createTemplate>[0];
    const template = await templateService.createTemplate(input);

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: "template_created",
      data: template,
      boardId: template.id, // Use template ID for SSE compatibility
    });

    return c.json(successResponse(template, "Template created successfully"), 201);
  } catch (error) {
    console.error("[TemplateRoutes] POST /templates error:", error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * DELETE /templates/:id
 * Delete a template
 */
templateRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deleted = await templateService.deleteTemplate(id);

    if (!deleted) {
      return c.json(notFoundResponse("Template", id), 404);
    }

    return c.json(successResponse({ id }, "Template deleted successfully"));
  } catch (error) {
    console.error("[TemplateRoutes] DELETE /templates/:id error:", error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /templates/:id/statuses
 * Get statuses for a template
 */
templateRoutes.get("/:id/statuses", async (c) => {
  try {
    const id = c.req.param("id");
    const statuses = await templateService.getTemplateStatuses(id);

    if (!statuses) {
      return c.json(notFoundResponse("Template", id), 404);
    }

    return c.json(successResponse(statuses, undefined, statuses.length));
  } catch (error) {
    console.error("[TemplateRoutes] GET /templates/:id/statuses error:", error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /templates/:id/statuses
 * Add status to a template
 */
templateRoutes.post("/:id/statuses", validateBody(createTemplateStatusSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const input = c.get("validatedBody") as Parameters<typeof templateService.addTemplateStatus>[1];
    const status = await templateService.addTemplateStatus(id, input);

    if (!status) {
      return c.json(notFoundResponse("Template", id), 404);
    }

    return c.json(successResponse(status, "Template status created successfully"), 201);
  } catch (error) {
    console.error("[TemplateRoutes] POST /templates/:id/statuses error:", error);
    return c.json(internalErrorResponse(error), 500);
  }
});
