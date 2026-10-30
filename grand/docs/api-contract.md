# Backend API contract

Browser → same-origin `/api/*` → Next BFF → server-only `BACKEND_API_URL`. JSON is not wrapped in a `data` envelope. All fields below are required unless marked optional. Response validation lives in [schemas.ts](../src/lib/api/schemas.ts).

| Method | BFF path / backend suffix              | Payload / response                                    |
| ------ | -------------------------------------- | ----------------------------------------------------- |
| GET    | `/api/artifacts` / `artifacts`         | `Artifact[]`                                          |
| GET    | `/api/artifacts/:id` / `artifacts/:id` | `Artifact`, 404 if missing                            |
| POST   | `/api/tours` / `tours`                 | `TourPreferences` → `TourPlan`                        |
| POST   | `/api/recognize` / `recognize`         | multipart field `image` → `RecognitionResult`         |
| GET    | `/api/entitlements` / `entitlements`   | `{vip:boolean, source:'backend'}`                     |
| GET    | `/api/audio/:id?locale=ar`             | `AudioTrack`; backend must enforce VIP again          |
| POST   | `/api/feedback` / `feedback`           | `FeedbackInput` → `FeedbackReceipt`                   |
| GET    | `/api/health`                          | BFF status and configured mode, not backend readiness |

## Models

Canonical definitions are in [types/index.ts](../src/types/index.ts). Artifact IDs must be lowercase ASCII letters, digits or hyphens for the current routing contract.

```ts
type Localized = { en: string; ar: string };
type TourPreferences = {
  duration: number; // API: 15..240 integer; UI currently 30/60/90/120
  interests: ("statue" | "jewelry" | "daily-life")[];
  accessible: boolean;
};
type TourPlan = {
  id: string;
  stops: Artifact[];
  duration: number;
  walkingMinutes: number;
  accessible: boolean;
  source: "backend";
};
type RecognitionResult = {
  artifactId: string;
  confidence: number; // 0..1; an estimate, not certainty
  similarIds: string[];
  source: "backend";
};
type AudioTrack = { url: string; title: string; transcript: string };
type FeedbackInput = {
  rating: number; // integer 1..5
  category: "experience" | "accessibility" | "services";
  message: string; // trimmed 10..2000 characters
  email?: string; // valid, <=254 characters
  consent: true;
};
type FeedbackReceipt = { id: string; persisted: boolean; source: "backend" };
```

An Artifact includes localized name/subtitle/description/story/material/date/imageAlt; image path; gallery; floor 0 or 1; positive visit duration; tags; featured flag; and normalized x/y coordinates. See the exact schema. Current map/quiz/sample UI use the educational dataset; replacing it with live inventory requires syncing the approved map dataset and quest references too.

## Images and authentication

- Accept JPEG, PNG and WebP up to 8MiB. The BFF limits the stream, checks MIME against file signature, then forwards the original multipart body.
- Model provider keys belong exclusively to Backend; never expose them through `NEXT_PUBLIC_*`.
- Forwarded cookies/Authorization are for the trusted configured backend only. Use the team's session system. Backend must verify entitlement on every premium audio request, even if the UI already checked it.
- Return an HTTPS signed audio URL with short expiry or an authenticated media service; protect the recording itself. Client state is never proof of VIP status.
- Persist feedback before returning `persisted:true`. The demo returns `false` and stores no message or email.

## Errors and limits

BFF errors are JSON `{ "code": "..." }`, with safe generic display text at the client. Common status codes: 400 malformed input, 403 invalid origin/VIP denial, 404 missing resource, 413 oversized body, 415 invalid image signature, 422 schema failure, 502 invalid/unreachable backend, 503 backend URL not configured. No upstream error bodies, tokens or stack traces are returned to the visitor.

Browser writes must have an origin matching the browser-facing Host, configured site URL or request origin. Do not trust arbitrary forwarded-host headers. Writes are not retried automatically. Configure the production Backend's own rate limiting, logging, retention policy and session protection before accepting public writes.
