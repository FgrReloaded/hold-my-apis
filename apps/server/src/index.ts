import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { sessionMiddleware } from "./middleware/session.middleware";
import { userRoutes } from "./routes/user.routes";
import { organizationRoutes } from "./routes/organization.routes";
import { auth } from "./lib/auth";

const baseCorsConfig = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCors, baseCorsConfig);

// Add global session middleware
fastify.addHook("preHandler", sessionMiddleware);

// Health check endpoint
fastify.get("/health", async (request, reply) => {
  reply.send({ status: "OK", timestamp: new Date().toISOString() });
});

// Protected endpoint for testing
fastify.get("/private", async (request, reply) => {
  if (!request.session) {
    reply.status(401).send({ error: "Authentication required" });
    return;
  }

  reply.send({
    message: "This is private",
    user: request.session.user,
  });
});

// Register API routes
fastify.register(userRoutes, { prefix: "/api/users" });
fastify.register(organizationRoutes, { prefix: "/api/organizations" });

// Better Auth routes
fastify.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      fastify.log.error("Authentication Error:", error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

const start = async () => {
  try {
    await fastify.listen({
      port: Number(process.env.PORT) || 3000,
      host: process.env.HOST || "0.0.0.0",
    });
    console.log("Server listening on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
