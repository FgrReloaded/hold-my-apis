import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { organizationRouter } from "./organization.router";
import { userRouter } from "./user.router";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  organization: organizationRouter,
  user: userRouter,
});
export type AppRouter = typeof appRouter;
