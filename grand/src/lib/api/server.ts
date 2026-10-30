import "server-only";
import { NextResponse } from "next/server";
import { artifacts, getArtifact } from "@/features/artifacts/data";
import { buildDemoTour } from "@/features/tours/planner";
import {
  feedbackInputSchema,
  responseSchema,
  tourPreferencesSchema,
} from "./schemas";
const MAX_IMAGE = 8 * 1024 * 1024;
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
const fail = (code: string, status: number) => json({ code }, status);
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const supplied = new URL(origin);
    if (!["http:", "https:"].includes(supplied.protocol)) return false;
    const allowed = new Set([new URL(request.url).origin]);
    // Next may reconstruct its internal URL with localhost. Host retains the
    // browser-facing authority. Do not trust arbitrary forwarded-host headers.
    const host = request.headers.get("host");
    if (host) allowed.add(`${supplied.protocol}//${host}`);
    if (process.env.NEXT_PUBLIC_SITE_URL)
      allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
    return allowed.has(supplied.origin);
  } catch {
    return false;
  }
}
export function imageMatchesType(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
  if (type === "image/webp")
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}
async function limitedBody(
  request: Request,
  limit: number,
): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new Error("BODY_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
async function relay(request: Request, path: string, bytes?: Uint8Array) {
  const base = process.env.BACKEND_API_URL;
  if (!base) return fail("BACKEND_NOT_CONFIGURED", 503);
  try {
    const target = new URL(
      path + new URL(request.url).search,
      base.endsWith("/") ? base : `${base}/`,
    );
    if (!["http:", "https:"].includes(target.protocol))
      return fail("BACKEND_NOT_CONFIGURED", 503);
    const headers = new Headers({ Accept: "application/json" });
    for (const key of ["content-type", "cookie", "authorization"]) {
      const value = request.headers.get(key);
      if (value) headers.set(key, value);
    }
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: bytes ? new Blob([bytes as BlobPart]) : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
    });
    if (!response.ok)
      return fail(
        response.status === 401
          ? "UNAUTHENTICATED"
          : response.status === 403
            ? "FORBIDDEN"
            : "BACKEND_REQUEST_FAILED",
        response.status >= 400 && response.status < 600 ? response.status : 502,
      );
    const payload: unknown = await response.json();
    const schema = responseSchema(`/${path}`);
    const parsed = schema?.safeParse(payload);
    if (!parsed?.success) return fail("INVALID_BACKEND_RESPONSE", 502);
    const data = parsed.data;
    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      "source" in data
    )
      return json({ ...data, source: "backend" });
    return json(data);
  } catch {
    return fail("BACKEND_UNAVAILABLE", 502);
  }
}
export async function handleApi(request: Request, path: string) {
  const known =
    /^(artifacts(?:\/[a-z0-9-]+)?|tours|recognize|entitlements|audio\/[a-z0-9-]+|feedback|health)$/;
  if (!known.test(path)) return fail("NOT_FOUND", 404);
  const expected = ["tours", "recognize", "feedback"].includes(path)
    ? "POST"
    : "GET";
  if (request.method !== expected) return fail("METHOD_NOT_ALLOWED", 405);
  if (request.method === "POST" && !isSameOrigin(request))
    return fail("ORIGIN_NOT_ALLOWED", 403);
  const apiMode = process.env.NEXT_PUBLIC_DATA_MODE === "api";
  let bytes: Uint8Array | undefined;
  let parsedJson: unknown;
  try {
    if (request.method === "POST") {
      bytes = await limitedBody(
        request,
        path === "recognize" ? MAX_IMAGE + 64 * 1024 : 16 * 1024,
      );
      if (path === "recognize") {
        const form = await new Request(request.url, {
          method: "POST",
          headers: request.headers,
          body: new Blob([bytes as BlobPart]),
        }).formData();
        const file = form.get("image");
        if (!(file instanceof File) || file.size === 0 || file.size > MAX_IMAGE)
          return fail("INVALID_IMAGE", 400);
        if (
          !imageMatchesType(
            new Uint8Array(await file.slice(0, 16).arrayBuffer()),
            file.type,
          )
        )
          return fail("INVALID_IMAGE_TYPE", 415);
      } else {
        try {
          parsedJson = JSON.parse(new TextDecoder().decode(bytes));
        } catch {
          return fail("INVALID_JSON", 400);
        }
        const validation = (
          path === "tours" ? tourPreferencesSchema : feedbackInputSchema
        ).safeParse(parsedJson);
        if (!validation.success) return fail("VALIDATION_ERROR", 422);
        parsedJson = validation.data;
      }
    }
    if (path === "health")
      return json({ status: "ok", mode: apiMode ? "api" : "demo" });
    if (apiMode) return relay(request, path, bytes);
    if (path === "artifacts") return json(artifacts);
    if (path.startsWith("artifacts/")) {
      const artifact = getArtifact(path.split("/")[1]);
      return artifact ? json(artifact) : fail("NOT_FOUND", 404);
    }
    if (path === "tours")
      return json(buildDemoTour(tourPreferencesSchema.parse(parsedJson)));
    if (path === "entitlements") return json({ vip: false, source: "demo" });
    if (path.startsWith("audio/")) return fail("VIP_REQUIRED", 403);
    if (path === "recognize")
      return json({
        artifactId: "golden-mask",
        confidence: 0,
        source: "demo",
        similarIds: ["ramses-ii", "broad-collar", "shabti"],
      });
    if (path === "feedback")
      return json({
        id: `demo-${crypto.randomUUID()}`,
        persisted: false,
        source: "demo",
      });
    return fail("NOT_FOUND", 404);
  } catch (error) {
    return fail(
      error instanceof Error && error.message === "BODY_TOO_LARGE"
        ? "BODY_TOO_LARGE"
        : "INVALID_REQUEST",
      error instanceof Error && error.message === "BODY_TOO_LARGE" ? 413 : 400,
    );
  }
}
