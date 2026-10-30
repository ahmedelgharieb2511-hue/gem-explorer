import { z } from "zod";
export const localizedSchema = z.object({ en: z.string(), ar: z.string() });
export const artifactSchema = z.object({
  id: z.string(),
  name: localizedSchema,
  subtitle: localizedSchema,
  description: localizedSchema,
  story: localizedSchema,
  era: z.enum([
    "old-kingdom",
    "middle-kingdom",
    "new-kingdom",
    "late-period",
    "greco-roman",
  ]),
  category: z.enum(["statue", "jewelry", "daily-life"]),
  material: localizedSchema,
  date: localizedSchema,
  image: z.string(),
  imageAlt: localizedSchema,
  gallery: z.string(),
  floor: z.union([z.literal(0), z.literal(1)]),
  duration: z.number().positive(),
  tags: z.array(z.string()),
  featured: z.boolean(),
  coordinates: z.object({ x: z.number(), y: z.number() }),
});
export const artifactsSchema = z.array(artifactSchema);
export const tourPreferencesSchema = z.object({
  duration: z.number().int().min(15).max(240),
  interests: z.array(z.enum(["statue", "jewelry", "daily-life"])).max(3),
  accessible: z.boolean(),
});
export const tourSchema = z.object({
  id: z.string(),
  stops: artifactsSchema,
  duration: z.number().nonnegative(),
  walkingMinutes: z.number().nonnegative(),
  accessible: z.boolean(),
  source: z.enum(["demo", "backend"]),
});
export const recognitionSchema = z.object({
  artifactId: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.enum(["demo", "backend"]),
  similarIds: z.array(z.string()),
});
export const entitlementSchema = z.object({
  vip: z.boolean(),
  source: z.enum(["demo", "backend"]),
});
export const audioSchema = z.object({
  url: z
    .url()
    .refine(
      (url) => url.startsWith("https://") || url.startsWith("http://localhost"),
      "Invalid audio URL",
    ),
  title: z.string(),
  transcript: z.string(),
});
export const feedbackInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  category: z.enum(["experience", "accessibility", "services"]),
  message: z.string().trim().min(10).max(2000),
  email: z.union([z.email().max(254), z.literal("")]).optional(),
  consent: z.literal(true),
});
export const feedbackReceiptSchema = z.object({
  id: z.string(),
  persisted: z.boolean(),
  source: z.enum(["demo", "backend"]),
});
export function responseSchema(path: string) {
  const clean = path.replace(/^\/api/, "").split("?")[0];
  if (clean === "/artifacts") return artifactsSchema;
  if (clean.startsWith("/artifacts/")) return artifactSchema;
  if (clean === "/tours") return tourSchema;
  if (clean === "/recognize") return recognitionSchema;
  if (clean === "/entitlements") return entitlementSchema;
  if (clean.startsWith("/audio/")) return audioSchema;
  if (clean === "/feedback") return feedbackReceiptSchema;
  return null;
}
