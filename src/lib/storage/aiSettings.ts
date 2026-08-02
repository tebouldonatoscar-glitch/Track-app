const API_KEY_STORAGE_KEY = "nutriscan-gemini-api-key";
const MODEL_STORAGE_KEY = "nutriscan-gemini-model";

/** Kept as a plain constant (not hardcoded deep in the UI) so it's easy to bump if Google renames/retires this model. */
export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

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
