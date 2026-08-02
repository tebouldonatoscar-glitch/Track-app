/**
 * Gemini error bodies are usually JSON like
 * {"error": {"code": 429, "message": "...", "status": "RESOURCE_EXHAUSTED"}}.
 * Pulls out the human-readable message so the UI can show Google's actual
 * reason instead of just our generic mapped error, which matters a lot for
 * diagnosing "429 straight away" cases (quota vs. wrong model vs. billing).
 */
export function extractGeminiErrorDetail(rawMessage: string | undefined): string | null {
  if (!rawMessage) return null;

  try {
    const parsed = JSON.parse(rawMessage);
    const message = parsed?.error?.message;
    if (typeof message === "string" && message.trim() !== "") {
      return message.trim();
    }
  } catch {
    // Not JSON - fall through and use the raw text if it's short enough to be useful.
  }

  const trimmed = rawMessage.trim();
  if (trimmed === "" || trimmed.length > 300) return null;
  return trimmed;
}
