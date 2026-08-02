import { parseGeminiEstimateJson } from "./parseGeminiResponse";
import type { GeminiEstimateResult } from "./types";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    dishName: { type: "string" },
    estimatedTotalWeightGrams: { type: "number" },
    energyKcal: { type: "number" },
    proteins: { type: "number" },
    carbohydrates: { type: "number" },
    sugars: { type: "number" },
    fat: { type: "number" },
    saturatedFat: { type: "number" },
    fiber: { type: "number" },
    salt: { type: "number" },
    confidenceNote: { type: "string" },
  },
  required: ["dishName", "energyKcal", "proteins", "carbohydrates", "fat"],
};

const PROMPT = `Tu es un assistant nutritionnel pour une app de suivi alimentaire personnel. On te donne la description d'un plat et éventuellement une photo. Estime au mieux, même avec de l'incertitude, les valeurs nutritionnelles TOTALES pour la portion décrite (pas pour 100g : pour la quantité entière du plat ou de la photo). Si la quantité n'est pas précisée, suppose une portion individuelle standard et indique ton hypothèse dans confidenceNote. Réponds uniquement avec le JSON demandé.`;

interface GeminiContentPart {
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

export interface EstimateMealParams {
  apiKey: string;
  model: string;
  description: string;
  imageBase64?: string;
  imageMimeType?: string;
  fetchImpl?: typeof fetch;
}

export async function estimateMealWithGemini(params: EstimateMealParams): Promise<GeminiEstimateResult> {
  const { apiKey, model, description, imageBase64, imageMimeType, fetchImpl = fetch } = params;

  if (!apiKey.trim()) return { ok: false, error: "missing_api_key" };

  const trimmedDescription = description.trim();
  const parts: GeminiContentPart[] = [
    {
      text: `${PROMPT}\n\nDescription du plat : ${
        trimmedDescription || "(aucune description fournie, base-toi uniquement sur la photo)"
      }`,
    },
  ];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: imageMimeType ?? "image/jpeg", data: imageBase64 } });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });
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

  const estimate = parseGeminiEstimateJson(text);
  if (!estimate) return { ok: false, error: "invalid_response" };

  return { ok: true, estimate };
}
