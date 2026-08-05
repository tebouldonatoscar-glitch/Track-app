import type { AiLabelScan } from "./types";
import { parseNutrientFields, type RawNutrientFields } from "./parseNutrientFields";

interface RawGeminiLabelJson extends RawNutrientFields {
  productName?: unknown;
  confidenceNote?: unknown;
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
    nutrients: parseNutrientFields(raw),
    confidenceNote,
  };
}
