import type { FastifyInstance } from "fastify";
import { OrganizationService } from "../services/organization.service";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  organizationIdSchema,
  checkSlugSchema,
  generateSlugSchema,
} from "../schemas/organization.schema";

export async function organizationRoutes(fastify: FastifyInstance) {
  // Create organization
  fastify.post(
    "/",
    {
      preHandler: async (request, reply) => {
        if (!request.session) {
          reply.status(401).send({ error: "Authentication required" });
          return;
        }
      },
      preValidation: async (request, reply) => {
        try {
          request.body = createOrganizationSchema.parse(request.body);
        } catch (error) {
          reply
            .status(400)
            .send({ error: "Invalid request data", details: error.errors });
          return;
        }
      },
    },
    async (request, reply) => {
      try {
        const organization = await OrganizationService.createOrganization({
          ...request.body,
          userId: request.session.user.id,
        });
        reply.status(201).send(organization);
      } catch (error) {
        if (error.code === "CONFLICT") {
          reply.status(409).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal server error" });
        }
      }
    }
  );

  // Get user organizations
  fastify.get(
    "/",
    {
      preHandler: async (request, reply) => {
        if (!request.session) {
          reply.status(401).send({ error: "Authentication required" });
          return;
        }
      },
    },
    async (request, reply) => {
      try {
        const organizations = await OrganizationService.getUserOrganizations(
          request.session.user.id
        );
        reply.send(organizations);
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Get organization by ID
  fastify.get(
    "/:organizationId",
    {
      preHandler: async (request, reply) => {
        if (!request.session) {
          reply.status(401).send({ error: "Authentication required" });
          return;
        }
      },
      preValidation: async (request, reply) => {
        try {
          request.params = organizationIdSchema.parse(request.params);
        } catch (error) {
          reply.status(400).send({ error: "Invalid organization ID" });
          return;
        }
      },
    },
    async (request, reply) => {
      try {
        const organization = await OrganizationService.getOrganizationById(
          request.params.organizationId,
          request.session.user.id
        );
        reply.send(organization);
      } catch (error) {
        if (error.code === "NOT_FOUND") {
          reply.status(404).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal server error" });
        }
      }
    }
  );

  // Update organization
  fastify.put(
    "/:organizationId",
    {
      preHandler: async (request, reply) => {
        if (!request.session) {
          reply.status(401).send({ error: "Authentication required" });
          return;
        }
      },
      preValidation: async (request, reply) => {
        try {
          request.params = { organizationId: request.params.organizationId };
          request.body = updateOrganizationSchema.parse(request.body);
        } catch (error) {
          reply
            .status(400)
            .send({ error: "Invalid request data", details: error.errors });
          return;
        }
      },
    },
    async (request, reply) => {
      try {
        const organization = await OrganizationService.updateOrganization(
          request.params.organizationId,
          request.session.user.id,
          request.body
        );
        reply.send(organization);
      } catch (error) {
        if (error.code === "FORBIDDEN") {
          reply.status(403).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal server error" });
        }
      }
    }
  );

  // Check slug availability
  fastify.get(
    "/slug/check",
    {
      preHandler: async (request, reply) => {
        if (!request.session) {
          reply.status(401).send({ error: "Authentication required" });
          return;
        }
      },
      preValidation: async (request, reply) => {
        try {
          request.query = checkSlugSchema.parse(request.query);
        } catch (error) {
          reply.status(400).send({ error: "Invalid slug parameter" });
          return;
        }
      },
    },
    async (request, reply) => {
      try {
        const available = await OrganizationService.checkSlugAvailability(
          request.query.slug
        );
        reply.send({ available });
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Generate slug from name
  fastify.post(
    "/slug/generate",
    {
      preHandler: async (request, reply) => {
        if (!request.session) {
          reply.status(401).send({ error: "Authentication required" });
          return;
        }
      },
      preValidation: async (request, reply) => {
        try {
          request.body = generateSlugSchema.parse(request.body);
        } catch (error) {
          reply
            .status(400)
            .send({ error: "Invalid request data", details: error.errors });
          return;
        }
      },
    },
    async (request, reply) => {
      try {
        const slug = await OrganizationService.generateSlugFromName(
          request.body.name
        );
        reply.send({ slug });
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
