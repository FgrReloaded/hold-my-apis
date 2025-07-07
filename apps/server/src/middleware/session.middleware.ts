import type { FastifyRequest, FastifyReply } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

declare module "fastify" {
  interface FastifyRequest {
    session?: {
      user: {
        id: string;
        email: string;
        name: string;
      };
    };
  }
}

export async function sessionMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  request.session = session;
}
