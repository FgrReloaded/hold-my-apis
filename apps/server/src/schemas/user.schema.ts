import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional(),
  image: z.string().url("Please enter a valid image URL").optional()
});
