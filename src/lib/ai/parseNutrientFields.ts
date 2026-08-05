import type { MacroBreakdown } from "@/lib/types/product";

/** Common shape of the 8 numeric nutrient fields Gemini returns for both a meal estimate and a label scan. */
export interface RawNutrientFields {
  energyKcal?: unknown;
  proteins?: unknown;
  carbohydrates?: unknown;
  sugars?: unknown;
  fat?: unknown;
  saturatedFat?: unknown;
  fiber?: unknown;
  salt?: unknown;
}

export function toNonNegativeNumber(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

/** Coerces the 8 raw nutrient fields to non-negative numbers, defaulting anything missing/invalid to 0. */
export function parseNutrientFields(raw: RawNutrientFields): MacroBreakdown {
  return {
    energyKcal: toNonNegativeNumber(raw.energyKcal),
    proteins: toNonNegativeNumber(raw.proteins),
    carbohydrates: toNonNegativeNumber(raw.carbohydrates),
    sugars: toNonNegativeNumber(raw.sugars),
    fat: toNonNegativeNumber(raw.fat),
    saturatedFat: toNonNegativeNumber(raw.saturatedFat),
    fiber: toNonNegativeNumber(raw.fiber),
    salt: toNonNegativeNumber(raw.salt),
  };
}
