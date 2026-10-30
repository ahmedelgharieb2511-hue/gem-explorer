import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { handleApi, imageMatchesType, isSameOrigin } from "@/lib/api/server";
const url = "http://localhost:3000/api/";
const request = (
  path: string,
  value: unknown,
  origin = "http://localhost:3000",
) =>
  new Request(url + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(value),
  });
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "demo"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("API contracts", () => {
  it("accepts a browser-facing Host when Next uses an internal URL", () => {
    expect(
      isSameOrigin(
        new Request("http://localhost:3000/api/tours", {
          headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOrigin(
        new Request(url + "tours", {
          headers: {
            host: "127.0.0.1:3000",
            origin: "https://untrusted.example",
          },
        }),
      ),
    ).toBe(false);
  });
  it("returns collection and 404 for missing artifacts", async () => {
    expect(
      (
        await (
          await handleApi(new Request(url + "artifacts"), "artifacts")
        ).json()
      ).length,
    ).toBe(8);
    expect(
      (
        await handleApi(
          new Request(url + "artifacts/missing"),
          "artifacts/missing",
        )
      ).status,
    ).toBe(404);
  });
  it("rejects invalid tour input on the server", async () => {
    expect(
      (
        await handleApi(
          request("tours", {
            duration: -1,
            interests: ["bad"],
            accessible: false,
          }),
          "tours",
        )
      ).status,
    ).toBe(422);
  });
  it("does not falsely confirm persistence in demo mode", async () => {
    const response = await handleApi(
      request("feedback", {
        rating: 5,
        category: "experience",
        message: "A wonderful museum experience.",
        consent: true,
      }),
      "feedback",
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      source: "demo",
      persisted: false,
    });
  });
  it("requires consent and a real rating", async () => {
    expect(
      (
        await handleApi(
          request("feedback", {
            rating: 0,
            category: "services",
            message: "hello",
            consent: false,
          }),
          "feedback",
        )
      ).status,
    ).toBe(422);
  });
  it("rejects requests from an unrelated origin", async () => {
    expect(
      (
        await handleApi(
          request("feedback", {}, "https://untrusted.example"),
          "feedback",
        )
      ).status,
    ).toBe(403);
  });
  it("keeps VIP audio locked at the endpoint", async () => {
    const access = await handleApi(
      new Request(url + "entitlements"),
      "entitlements",
    );
    expect(await access.json()).toMatchObject({ vip: false });
    expect(
      (
        await handleApi(
          new Request(url + "audio/golden-mask"),
          "audio/golden-mask",
        )
      ).status,
    ).toBe(403);
  });
  it("checks image signature instead of trusting MIME", () => {
    expect(
      imageMatchesType(
        new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
        "image/png",
      ),
    ).toBe(true);
    expect(
      imageMatchesType(new TextEncoder().encode("<script>"), "image/png"),
    ).toBe(false);
  });
  it("rejects an invalid image upload", async () => {
    const data = new FormData();
    data.set(
      "image",
      new File(["not an image"], "fake.png", { type: "image/png" }),
    );
    expect(
      (
        await handleApi(
          new Request(url + "recognize", { method: "POST", body: data }),
          "recognize",
        )
      ).status,
    ).toBe(415);
  });
  it("labels valid demo recognition as a simulation", async () => {
    const data = new FormData();
    data.set(
      "image",
      new File(
        [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0])],
        "test.png",
        { type: "image/png" },
      ),
    );
    const response = await handleApi(
      new Request(url + "recognize", { method: "POST", body: data }),
      "recognize",
    );
    expect(await response.json()).toMatchObject({
      source: "demo",
      confidence: 0,
    });
  });
  it("rejects oversized JSON requests", async () => {
    expect(
      (
        await handleApi(
          request("feedback", { message: "x".repeat(17000) }),
          "feedback",
        )
      ).status,
    ).toBe(413);
  });
  it("returns safe errors for a disconnected real backend", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "api");
    vi.stubEnv("BACKEND_API_URL", "");
    expect(
      (await handleApi(new Request(url + "artifacts"), "artifacts")).status,
    ).toBe(503);
  });
  it("rejects malformed backend replies without silently using demo data", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "api");
    vi.stubEnv("BACKEND_API_URL", "https://backend.example/api/");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ bad: true })),
    );
    expect(
      (await handleApi(new Request(url + "artifacts"), "artifacts")).status,
    ).toBe(502);
  });
  it("relays verified VIP access from backend with private cache rules", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "api");
    vi.stubEnv("BACKEND_API_URL", "https://backend.example/api/");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json({ vip: true, source: "backend" })),
    );
    const response = await handleApi(
      new Request(url + "entitlements"),
      "entitlements",
    );
    expect(await response.json()).toMatchObject({
      vip: true,
      source: "backend",
    });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
