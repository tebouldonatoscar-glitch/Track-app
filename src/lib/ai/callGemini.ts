export interface GeminiContentPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export type GeminiCallErrorCode =
  | "missing_api_key"
  | "invalid_key"
  | "network_error"
  | "rate_limited"
  | "invalid_response"
  | "api_error"
  | "timeout";

export type GeminiCallResult = { ok: true; text: string } | { ok: false; error: GeminiCallErrorCode; message?: string };

export interface CallGeminiParams {
  apiKey: string;
  model: string;
  parts: GeminiContentPart[];
  responseSchema: object;
  fetchImpl?: typeof fetch;
}

// A photo (especially one sent as-is because the browser couldn't decode it
// for resizing, see resizeImage.ts) can be several MB of base64 on a slow
// mobile connection. Without a timeout, a stalled request leaves the UI
// stuck on "Estimation en cours..." forever with no way for the user to
// know something went wrong.
const REQUEST_TIMEOUT_MS = 45_000;

/**
 * Shared low-level Gemini generateContent call: builds the request, maps
 * HTTP-level failures to typed error codes, and extracts the raw JSON text
 * from the first candidate. Callers own their own prompt/schema and are
 * responsible for parsing that text into their specific shape.
 */
export async function callGeminiGenerateContent(params: CallGeminiParams): Promise<GeminiCallResult> {
  const { apiKey, model, parts, responseSchema, fetchImpl = fetch } = params;

  if (!apiKey.trim()) return { ok: false, error: "missing_api_key" };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
        },
      }),
      signal: abortController.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return { ok: false, error: "timeout" };
    return { ok: false, error: "network_error" };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message: string | undefined;
    try {
      message = await response.text();
    } catch {
      message = undefined;
    }

    if (response.status === 403) return { ok: false, error: "invalid_key", message };
    if (response.status === 400) {
      // Google returns 400 both for a malformed/rejected key and for other
      // request problems (e.g. an invalid model name) - the message body is
      // the only way to tell them apart, so surface it rather than guessing.
      const looksLikeKeyIssue = /api key|api_key_invalid|permission/i.test(message ?? "");
      return { ok: false, error: looksLikeKeyIssue ? "invalid_key" : "api_error", message };
    }
    if (response.status === 429) return { ok: false, error: "rate_limited", message };

    return { ok: false, error: "api_error", message };
  }

  let data: GeminiApiResponse;
  try {
    data = (await response.json()) as GeminiApiResponse;
  } catch {
    return { ok: false, error: "invalid_response" };
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") return { ok: false, error: "invalid_response" };

  return { ok: true, text };
}
