import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(50, "Organization name must be less than 50 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(30, "Slug must be less than 30 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal(""))
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(50, "Organization name must be less than 50 characters").optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal(""))
});

export const organizationIdSchema = z.object({
  organizationId: z.string().cuid("Invalid organization ID")
});

export const checkSlugSchema = z.object({
  slug: z.string().min(2, "Slug must be at least 2 characters").max(30, "Slug must be less than 30 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
});

export const generateSlugSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters")
});
