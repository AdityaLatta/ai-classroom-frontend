import { z } from "zod";

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  type: z.enum(["TEXT", "VIDEO", "LIVE_CLASS"]),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .max(50000, "Content must be at most 50000 characters")
    .optional()
    .or(z.literal("")),
  videoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .optional(),
});

export const updateLessonSchema = createLessonSchema.partial();
