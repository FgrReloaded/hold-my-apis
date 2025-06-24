import { protectedProcedure, router } from "../lib/trpc";
import { OrganizationService } from "../services/organization.service";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  organizationIdSchema,
  checkSlugSchema,
  generateSlugSchema
} from "../schemas/organization.schema";

export const organizationRouter = router({
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ input, ctx }) => {
      return OrganizationService.createOrganization({
        ...input,
        userId: ctx.session.user.id
      });
    }),

  getUserOrganizations: protectedProcedure
    .query(async ({ ctx }) => {
      return OrganizationService.getUserOrganizations(ctx.session.user.id);
    }),

  getById: protectedProcedure
    .input(organizationIdSchema)
    .query(async ({ input, ctx }) => {
      return OrganizationService.getOrganizationById(
        input.organizationId,
        ctx.session.user.id
      );
    }),

  update: protectedProcedure
    .input(organizationIdSchema.merge(updateOrganizationSchema))
    .mutation(async ({ input, ctx }) => {
      const { organizationId, ...data } = input;
      return OrganizationService.updateOrganization(
        organizationId,
        ctx.session.user.id,
        data
      );
    }),

  checkSlugAvailability: protectedProcedure
    .input(checkSlugSchema)
    .query(async ({ input }) => {
      return {
        available: await OrganizationService.checkSlugAvailability(input.slug)
      };
    }),

  generateSlug: protectedProcedure
    .input(generateSlugSchema)
    .query(async ({ input }) => {
      return {
        slug: await OrganizationService.generateSlugFromName(input.name)
      };
    })
});
