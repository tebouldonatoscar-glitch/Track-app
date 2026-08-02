import type { AiLabelScan } from "./types";

interface RawGeminiLabelJson {
  productName?: unknown;
  energyKcal?: unknown;
  proteins?: unknown;
  carbohydrates?: unknown;
  sugars?: unknown;
  fat?: unknown;
  saturatedFat?: unknown;
  fiber?: unknown;
  salt?: unknown;
  confidenceNote?: unknown;
}

function toNonNegativeNumber(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

/**
 * Parses and validates the JSON text Gemini returns for a nutrition label
 * scan. Defensive by design, same reasoning as parseGeminiEstimateJson: the
 * model can still omit fields or return malformed JSON despite the schema.
 */
export function parseGeminiLabelJson(jsonText: string): AiLabelScan | null {
  let raw: RawGeminiLabelJson;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return null;
  }

  if (typeof raw !== "object" || raw === null) return null;

  // Calories are the one field we require to be a real number - without it
  // the scan is unusable as a starting point for the form.
  if (typeof raw.energyKcal !== "number" || !Number.isFinite(raw.energyKcal)) return null;

  const productName =
    typeof raw.productName === "string" && raw.productName.trim() !== "" ? raw.productName.trim() : null;

  const confidenceNote =
    typeof raw.confidenceNote === "string" && raw.confidenceNote.trim() !== "" ? raw.confidenceNote.trim() : null;

  return {
    productName,
    nutrients: {
      energyKcal: toNonNegativeNumber(raw.energyKcal),
      proteins: toNonNegativeNumber(raw.proteins),
      carbohydrates: toNonNegativeNumber(raw.carbohydrates),
      sugars: toNonNegativeNumber(raw.sugars),
      fat: toNonNegativeNumber(raw.fat),
      saturatedFat: toNonNegativeNumber(raw.saturatedFat),
      fiber: toNonNegativeNumber(raw.fiber),
      salt: toNonNegativeNumber(raw.salt),
    },
    confidenceNote,
  };
}
