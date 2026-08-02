import { describe, expect, it, vi } from "vitest";
import { estimateMealWithGemini } from "@/lib/ai/geminiEstimate";

function mockGeminiResponse(estimateJson: Record<string, unknown>) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify(estimateJson) }] } }],
    }),
  };
}

describe("estimateMealWithGemini", () => {
  it("returns missing_api_key without calling fetch when no key is provided", async () => {
    const fetchMock = vi.fn();
    const result = await estimateMealWithGemini({
      apiKey: "",
      model: "gemini-2.0-flash",
      description: "Une pomme",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "missing_api_key" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a parsed estimate on a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockGeminiResponse({
        dishName: "Salade César",
        estimatedTotalWeightGrams: 250,
        energyKcal: 400,
        proteins: 20,
        carbohydrates: 15,
        fat: 28,
      })
    );

    const result = await estimateMealWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      description: "Une salade César",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.estimate.dishName).toBe("Salade César");
      expect(result.estimate.macros.energyKcal).toBe(400);
    }

    // The API key must not leak into the request body, only the URL.
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("key=test-key");
    expect(JSON.parse(options.body).contents[0].parts[0].text).toContain("Une salade César");
  });

  it("includes the image as inline data when a photo is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockGeminiResponse({ energyKcal: 100, dishName: "Plat" }));
    await estimateMealWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      description: "",
      imageBase64: "ZmFrZS1pbWFnZS1kYXRh",
      imageMimeType: "image/jpeg",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.contents[0].parts[1].inlineData).toEqual({
      mimeType: "image/jpeg",
      data: "ZmFrZS1pbWFnZS1kYXRh",
    });
  });

  it("maps a 403 response to invalid_key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    const result = await estimateMealWithGemini({
      apiKey: "bad-key",
      model: "gemini-2.0-flash",
      description: "Une pomme",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "invalid_key" });
  });

  it("maps a 429 response to rate_limited", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    const result = await estimateMealWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      description: "Une pomme",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "rate_limited" });
  });

  it("returns network_error when fetch throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await estimateMealWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      description: "Une pomme",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "network_error" });
  });

  it("returns invalid_response when the candidate text is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    const result = await estimateMealWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      description: "Une pomme",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "invalid_response" });
  });

  it("returns invalid_response when the candidate text is not parseable JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "not json" }] } }] }),
      }
    );
    const result = await estimateMealWithGemini({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      description: "Une pomme",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: false, error: "invalid_response" });
  });
});
