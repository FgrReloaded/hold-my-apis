import { protectedProcedure, router } from "../lib/trpc";
import { UserService } from "../services/user.service";
import { updateUserProfileSchema } from "../schemas/user.schema";

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return UserService.getUserProfile(ctx.session.user.id);
    }),

  updateProfile: protectedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ input, ctx }) => {
      return UserService.updateUserProfile(ctx.session.user.id, input);
    }),

  hasCompletedOnboarding: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        completed: await UserService.hasCompletedOnboarding(ctx.session.user.id)
      };
    })
});
