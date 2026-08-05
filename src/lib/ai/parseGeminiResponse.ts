import type { AiMealEstimate } from "./types";
import { parseNutrientFields, type RawNutrientFields } from "./parseNutrientFields";

interface RawGeminiEstimateJson extends RawNutrientFields {
  dishName?: unknown;
  estimatedTotalWeightGrams?: unknown;
  confidenceNote?: unknown;
}

/**
 * Parses and validates the JSON text Gemini returns for a meal estimate.
 * Defensive by design: the model is asked to follow a schema but can still
 * omit fields or return malformed JSON, so every field is checked rather
 * than trusted.
 */
export function parseGeminiEstimateJson(jsonText: string): AiMealEstimate | null {
  let raw: RawGeminiEstimateJson;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return null;
  }

  if (typeof raw !== "object" || raw === null) return null;

  // Calories are the one field we require to be a real number - without it
  // the estimate is unusable.
  if (typeof raw.energyKcal !== "number" || !Number.isFinite(raw.energyKcal)) return null;

  const dishName =
    typeof raw.dishName === "string" && raw.dishName.trim() !== "" ? raw.dishName.trim() : "Plat estimé";

  const weight =
    typeof raw.estimatedTotalWeightGrams === "number" &&
    Number.isFinite(raw.estimatedTotalWeightGrams) &&
    raw.estimatedTotalWeightGrams > 0
      ? raw.estimatedTotalWeightGrams
      : null;

  const confidenceNote =
    typeof raw.confidenceNote === "string" && raw.confidenceNote.trim() !== "" ? raw.confidenceNote.trim() : null;

  return {
    dishName,
    estimatedTotalWeightGrams: weight,
    macros: parseNutrientFields(raw),
    confidenceNote,
  };
}
