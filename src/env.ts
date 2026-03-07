import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_API_URL must not be empty"),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_GOOGLE_CLIENT_ID must not be empty"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
});
