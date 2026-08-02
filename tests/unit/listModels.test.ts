import { describe, expect, it, vi } from "vitest";
import { listAvailableGeminiModels } from "@/lib/ai/listModels";

describe("listAvailableGeminiModels", () => {
  it("returns missing_api_key without calling fetch when no key is provided", async () => {
    const fetchMock = vi.fn();
    const result = await listAvailableGeminiModels("", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "missing_api_key" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns only models that support generateContent, with the models/ prefix stripped", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { name: "models/gemini-1.5-flash", supportedGenerationMethods: ["generateContent", "countTokens"] },
          { name: "models/embedding-001", supportedGenerationMethods: ["embedContent"] },
          { name: "models/gemini-1.5-pro", supportedGenerationMethods: ["generateContent"] },
        ],
      }),
    });

    const result = await listAvailableGeminiModels("test-key", fetchMock as unknown as typeof fetch);

    expect(result).toEqual({ ok: true, models: ["gemini-1.5-flash", "gemini-1.5-pro"] });
  });

  it("returns an empty list rather than failing when no models are returned", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const result = await listAvailableGeminiModels("test-key", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: true, models: [] });
  });

  it("maps a 403 response to invalid_key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => "forbidden" });
    const result = await listAvailableGeminiModels("bad-key", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "invalid_key", message: "forbidden" });
  });

  it("returns network_error when fetch throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await listAvailableGeminiModels("test-key", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "network_error" });
  });
});
