export type Locale = "en" | "ar";
export type Localized = { en: string; ar: string };
export type Artifact = {
  id: string;
  name: Localized;
  subtitle: Localized;
  description: Localized;
  story: Localized;
  era:
    | "old-kingdom"
    | "middle-kingdom"
    | "new-kingdom"
    | "late-period"
    | "greco-roman";
  category: "statue" | "jewelry" | "daily-life";
  material: Localized;
  date: Localized;
  image: string;
  imageAlt: Localized;
  gallery: string;
  floor: 0 | 1;
  duration: number;
  tags: string[];
  featured: boolean;
  coordinates: { x: number; y: number };
};
export type TourPreferences = {
  duration: number;
  interests: string[];
  accessible: boolean;
};
export type TourPlan = {
  id: string;
  stops: Artifact[];
  duration: number;
  walkingMinutes: number;
  accessible: boolean;
  source: "demo" | "backend";
};
export type RecognitionResult = {
  artifactId: string;
  confidence: number;
  source: "demo" | "backend";
  similarIds: string[];
};
export type Entitlement = { vip: boolean; source: "demo" | "backend" };
export type AudioTrack = { url: string; title: string; transcript: string };
export type FeedbackInput = {
  rating: number;
  category: "experience" | "accessibility" | "services";
  message: string;
  email?: string;
  consent: boolean;
};
export type FeedbackReceipt = {
  id: string;
  persisted: boolean;
  source: "demo" | "backend";
};
