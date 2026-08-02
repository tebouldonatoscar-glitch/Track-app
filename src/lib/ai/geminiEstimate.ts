import { callGeminiGenerateContent, type GeminiContentPart } from "./callGemini";
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

export interface EstimateMealParams {
  apiKey: string;
  model: string;
  description: string;
  imageBase64?: string;
  imageMimeType?: string;
  fetchImpl?: typeof fetch;
}

export async function estimateMealWithGemini(params: EstimateMealParams): Promise<GeminiEstimateResult> {
  const { apiKey, model, description, imageBase64, imageMimeType, fetchImpl } = params;

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

  const result = await callGeminiGenerateContent({ apiKey, model, parts, responseSchema: RESPONSE_SCHEMA, fetchImpl });
  if (!result.ok) return result;

  const estimate = parseGeminiEstimateJson(result.text);
  if (!estimate) return { ok: false, error: "invalid_response" };

  return { ok: true, estimate };
}
