import type { z } from "zod";
import { responseSchema } from "./schemas";
export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 0, code = "NETWORK_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>,
): Promise<T> {
  const url = path.startsWith("/api/")
    ? path
    : `/api${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError("Unable to reach the server. Please retry.");
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code =
      body && typeof body === "object" && "code" in body
        ? String(body.code)
        : "REQUEST_FAILED";
    throw new ApiError(
      "The request could not be completed. Please retry.",
      response.status,
      code,
    );
  }
  const validator = schema ?? responseSchema(url);
  if (validator) {
    const result = validator.safeParse(body);
    if (!result.success)
      throw new ApiError(
        "The server returned an unexpected response.",
        502,
        "INVALID_RESPONSE",
      );
    return result.data as T;
  }
  return body as T;
}
