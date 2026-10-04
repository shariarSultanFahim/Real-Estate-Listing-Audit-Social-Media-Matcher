import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // JWT & Security
  JWT_SECRET: z.string().default("dev-jwt-secret-replace-with-secure-key-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  // Matching Engine
  MATCH_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(100).default(70),
  MATCH_HIGH_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(100).default(95),

  // Audit Schedule
  AUDIT_SCHEDULER_ENABLED: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("false"),
  AUDIT_SCHEDULE_INTERVAL: z.string().default("every_6_hours"),

  // Apify Integration — all optional; integration gracefully no-ops when missing
  APIFY_API_TOKEN: z.string().optional(),
  APIFY_ZILLOW_ACTOR_ID: z.string().optional(),
  APIFY_REALTOR_ACTOR_ID: z.string().optional(),
  APIFY_LACDB_ACTOR_ID: z.string().optional(),

  // Bright Data Integration
  BRIGHTDATA_API_TOKEN: z.string().optional(),
  BRIGHTDATA_PROXY_HOST: z.string().optional(),
  BRIGHTDATA_PROXY_USERNAME: z.string().optional(),
  BRIGHTDATA_PROXY_PASSWORD: z.string().optional(),
  BRIGHTDATA_ZILLOW_DATASET_ID: z.string().optional(),
  BRIGHTDATA_REALTOR_DATASET_ID: z.string().optional(),
  BRIGHTDATA_LACDB_DATASET_ID: z.string().optional(),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_parsed.error.flatten().fieldErrors);
  // In test environment, do not exit immediately if database isn't running
  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }
}

export const config = _parsed.success ? _parsed.data : ({} as z.infer<typeof envSchema>);
