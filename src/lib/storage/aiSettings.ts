const API_KEY_STORAGE_KEY = "nutriscan-gemini-api-key";
const MODEL_STORAGE_KEY = "nutriscan-gemini-model";

/**
 * "gemini-flash-latest" is a floating alias Google maintains to always point
 * at their current recommended flash-tier model. Two previous defaults
 * pinned to a specific version (gemini-2.0-flash: zero free quota on some
 * keys; gemini-1.5-flash: since removed, "not found for API version
 * v1beta") both went stale within the same day. The alias trades pinned
 * reproducibility for not needing another emergency fix every time Google
 * reshuffles model availability - the right trade for a free personal tool.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredGeminiApiKey(): string {
  if (!isBrowser()) return "";
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
}

export function setStoredGeminiApiKey(key: string): void {
  if (!isBrowser()) return;
  const trimmed = key.trim();
  if (trimmed === "") {
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  } else {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
  }
}

export function getStoredGeminiModel(): string {
  if (!isBrowser()) return DEFAULT_GEMINI_MODEL;
  return window.localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_GEMINI_MODEL;
}

export function setStoredGeminiModel(model: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(MODEL_STORAGE_KEY, model.trim() || DEFAULT_GEMINI_MODEL);
}
