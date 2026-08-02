import { describe, expect, it } from "vitest";
import { extractGeminiErrorDetail } from "@/lib/ai/extractErrorDetail";

describe("extractGeminiErrorDetail", () => {
  it("pulls the message out of a Gemini-style JSON error body", () => {
    const body = JSON.stringify({
      error: { code: 429, message: "You exceeded your current quota.", status: "RESOURCE_EXHAUSTED" },
    });
    expect(extractGeminiErrorDetail(body)).toBe("You exceeded your current quota.");
  });

  it("falls back to the raw text when it isn't JSON but is short", () => {
    expect(extractGeminiErrorDetail("Service unavailable")).toBe("Service unavailable");
  });

  it("returns null for undefined input", () => {
    expect(extractGeminiErrorDetail(undefined)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(extractGeminiErrorDetail("")).toBeNull();
    expect(extractGeminiErrorDetail("   ")).toBeNull();
  });

  it("returns null for an overly long raw (non-JSON) body rather than dumping it in the UI", () => {
    expect(extractGeminiErrorDetail("x".repeat(500))).toBeNull();
  });

  it("falls back to the raw short JSON when it has no error.message field", () => {
    const body = JSON.stringify({ foo: "bar" });
    expect(extractGeminiErrorDetail(body)).toBe(body);
  });
});
