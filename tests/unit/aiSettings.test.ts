import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_GEMINI_MODEL,
  getStoredGeminiApiKey,
  getStoredGeminiModel,
  setStoredGeminiApiKey,
  setStoredGeminiModel,
} from "@/lib/storage/aiSettings";

describe("aiSettings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty api key and the default model when nothing is stored", () => {
    expect(getStoredGeminiApiKey()).toBe("");
    expect(getStoredGeminiModel()).toBe(DEFAULT_GEMINI_MODEL);
  });

  it("persists and retrieves an api key, trimmed", () => {
    setStoredGeminiApiKey("  my-key-123  ");
    expect(getStoredGeminiApiKey()).toBe("my-key-123");
  });

  it("clears the stored api key when set to an empty string", () => {
    setStoredGeminiApiKey("my-key-123");
    setStoredGeminiApiKey("   ");
    expect(getStoredGeminiApiKey()).toBe("");
  });

  it("persists a custom model and falls back to the default if cleared", () => {
    setStoredGeminiModel("gemini-1.5-pro");
    expect(getStoredGeminiModel()).toBe("gemini-1.5-pro");

    setStoredGeminiModel("");
    expect(getStoredGeminiModel()).toBe(DEFAULT_GEMINI_MODEL);
  });
});
