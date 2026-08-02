export type ListModelsResult =
  | { ok: true; models: string[] }
  | { ok: false; error: "missing_api_key" | "invalid_key" | "network_error" | "api_error"; message?: string };

interface GeminiModel {
  name?: string;
  supportedGenerationMethods?: string[];
}

interface GeminiListModelsResponse {
  models?: GeminiModel[];
}

/**
 * Queries Google's ListModels endpoint so the app never has to guess a
 * model name: which Gemini models are free-tier/available shifts over time,
 * and hardcoding one goes stale (see DEFAULT_GEMINI_MODEL history).
 */
export async function listAvailableGeminiModels(
  apiKey: string,
  fetchImpl: typeof fetch = fetch
): Promise<ListModelsResult> {
  if (!apiKey.trim()) return { ok: false, error: "missing_api_key" };

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetchImpl(url);
  } catch {
    return { ok: false, error: "network_error" };
  }

  if (!response.ok) {
    let message: string | undefined;
    try {
      message = await response.text();
    } catch {
      message = undefined;
    }
    if (response.status === 400 || response.status === 403) {
      return { ok: false, error: "invalid_key", message };
    }
    return { ok: false, error: "api_error", message };
  }

  let data: GeminiListModelsResponse;
  try {
    data = (await response.json()) as GeminiListModelsResponse;
  } catch {
    return { ok: false, error: "api_error" };
  }

  const models = (data.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name?.replace(/^models\//, ""))
    .filter((name): name is string => Boolean(name));

  return { ok: true, models };
}
