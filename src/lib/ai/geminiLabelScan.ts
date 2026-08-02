import { callGeminiGenerateContent, type GeminiContentPart } from "./callGemini";
import { parseGeminiLabelJson } from "./parseGeminiLabelResponse";
import type { GeminiLabelScanResult } from "./types";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    productName: { type: "string" },
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
  required: ["energyKcal"],
};

const PROMPT = `Tu es un assistant qui lit des tableaux de valeurs nutritionnelles ("nutrition facts") sur des emballages alimentaires, pour une app de suivi alimentaire. On te donne une photo d'un tel tableau. Lis attentivement les valeurs telles qu'imprimées, et renvoie-les normalisées pour 100g ou 100ml (pas pour une portion). Si l'étiquette n'affiche que des valeurs "par portion", convertis-les toi-même vers 100g/100ml en utilisant le poids de portion imprimé, et mentionne cette conversion dans confidenceNote. Si le nom du produit est visible sur la photo, renseigne productName. Si une valeur n'est vraiment pas lisible, ne l'invente pas : omets-la plutôt que de deviner. Réponds uniquement avec le JSON demandé.`;

export interface ScanLabelParams {
  apiKey: string;
  model: string;
  imageBase64: string;
  imageMimeType?: string;
  fetchImpl?: typeof fetch;
}

export async function scanNutritionLabelWithGemini(params: ScanLabelParams): Promise<GeminiLabelScanResult> {
  const { apiKey, model, imageBase64, imageMimeType, fetchImpl } = params;

  const parts: GeminiContentPart[] = [
    { text: PROMPT },
    { inlineData: { mimeType: imageMimeType ?? "image/jpeg", data: imageBase64 } },
  ];

  const result = await callGeminiGenerateContent({ apiKey, model, parts, responseSchema: RESPONSE_SCHEMA, fetchImpl });
  if (!result.ok) return result;

  const scan = parseGeminiLabelJson(result.text);
  if (!scan) return { ok: false, error: "invalid_response" };

  return { ok: true, scan };
}
