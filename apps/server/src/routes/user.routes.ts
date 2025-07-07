import type { FastifyInstance } from "fastify";
import { UserService } from "../services/user.service";
import { updateUserProfileSchema } from "../schemas/user.schema";

export async function userRoutes(fastify: FastifyInstance) {
  // Get user profile
  fastify.get(
    "/profile",
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
        const profile = await UserService.getUserProfile(
          request.session.user.id
        );
        reply.send(profile);
      } catch (error) {
        if (error.code === "NOT_FOUND") {
          reply.status(404).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal server error" });
        }
      }
    }
  );

  // Update user profile
  fastify.put(
    "/profile",
    {
      preHandler: async (request, reply) => {
        if (!request.session) {
          reply.status(401).send({ error: "Authentication required" });
          return;
        }
      },
      preValidation: async (request, reply) => {
        try {
          request.body = updateUserProfileSchema.parse(request.body);
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
        const updatedProfile = await UserService.updateUserProfile(
          request.session.user.id,
          request.body
        );
        reply.send(updatedProfile);
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Check if user has completed onboarding
  fastify.get(
    "/onboarding/status",
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
        const completed = await UserService.hasCompletedOnboarding(
          request.session.user.id
        );
        reply.send({ completed });
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
