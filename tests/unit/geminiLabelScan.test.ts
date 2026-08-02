import { describe, expect, it, vi } from "vitest";
import { scanNutritionLabelWithGemini } from "@/lib/ai/geminiLabelScan";

function mockGeminiResponse(scanJson: Record<string, unknown>) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify(scanJson) }] } }],
    }),
  };
}

describe("scanNutritionLabelWithGemini", () => {
  it("returns missing_api_key without calling fetch when no key is provided", async () => {
    const fetchMock = vi.fn();
    const result = await scanNutritionLabelWithGemini({
      apiKey: "",
      model: "gemini-2.0-flash",
      imageBase64: "ZmFrZQ==",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "missing_api_key" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a parsed scan on a successful response and sends the image as inline data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockGeminiResponse({ productName: "Soda XYZ", energyKcal: 42, sugars: 10.6 })
    );

    const result = await scanNutritionLabelWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      imageBase64: "ZmFrZS1pbWFnZS1kYXRh",
      imageMimeType: "image/jpeg",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.scan.productName).toBe("Soda XYZ");
      expect(result.scan.nutrients.energyKcal).toBe(42);
    }

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.contents[0].parts[1].inlineData).toEqual({
      mimeType: "image/jpeg",
      data: "ZmFrZS1pbWFnZS1kYXRh",
    });
  });

  it("maps a 403 response to invalid_key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    const result = await scanNutritionLabelWithGemini({
      apiKey: "bad-key",
      model: "gemini-2.0-flash",
      imageBase64: "ZmFrZQ==",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "invalid_key" });
  });

  it("returns network_error when fetch throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await scanNutritionLabelWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      imageBase64: "ZmFrZQ==",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "network_error" });
  });

  it("returns invalid_response when the candidate text is not parseable JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: "not json" }] } }] }),
    });
    const result = await scanNutritionLabelWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      imageBase64: "ZmFrZQ==",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "invalid_response" });
  });
});
