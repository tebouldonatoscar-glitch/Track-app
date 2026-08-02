import type { MacroBreakdown, NutrientsPer100g } from "@/lib/types/product";

function scaleValue(per100g: number | null, quantityGrams: number): number {
  if (per100g === null) return 0;
  return (per100g * quantityGrams) / 100;
}

/**
 * Computes macro totals for a given quantity (in grams) from per-100g values.
 * Missing nutrients are treated as 0 in the output but callers should check
 * `hasCompleteData` on the source product to warn users about missing data.
 */
export function calculateMacrosForQuantity(
  nutrients: NutrientsPer100g,
  quantityGrams: number
): MacroBreakdown {
  const safeQuantity = Number.isFinite(quantityGrams) && quantityGrams > 0 ? quantityGrams : 0;

  return {
    energyKcal: roundTo(scaleValue(nutrients.energyKcal, safeQuantity), 0),
    proteins: roundTo(scaleValue(nutrients.proteins, safeQuantity), 1),
    carbohydrates: roundTo(scaleValue(nutrients.carbohydrates, safeQuantity), 1),
    sugars: roundTo(scaleValue(nutrients.sugars, safeQuantity), 1),
    fat: roundTo(scaleValue(nutrients.fat, safeQuantity), 1),
    saturatedFat: roundTo(scaleValue(nutrients.saturatedFat, safeQuantity), 1),
    fiber: roundTo(scaleValue(nutrients.fiber, safeQuantity), 1),
    salt: roundTo(scaleValue(nutrients.salt, safeQuantity), 2),
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function hasCompleteNutrientData(nutrients: NutrientsPer100g): boolean {
  return (
    nutrients.energyKcal !== null &&
    nutrients.proteins !== null &&
    nutrients.carbohydrates !== null &&
    nutrients.fat !== null
  );
}

/**
 * Ratio of protein calories to total calories, used to highlight
 * protein-dense products for sport/fitness use cases.
 */
export function proteinCalorieRatio(macros: MacroBreakdown): number | null {
  if (macros.energyKcal <= 0) return null;
  const proteinKcal = macros.proteins * 4;
  return roundTo((proteinKcal / macros.energyKcal) * 100, 1);
}

export function isValidQuantity(quantityGrams: number): boolean {
  return Number.isFinite(quantityGrams) && quantityGrams > 0 && quantityGrams <= 5000;
}

/**
 * Converts a nutrient value given "per unit" (e.g. per egg) to its per-100g
 * equivalent, so unit-based products can still be stored in the canonical
 * per-100g shape used everywhere else.
 */
export function convertPerUnitToPer100g(value: number | null, unitWeightGrams: number): number | null {
  if (value === null || !Number.isFinite(unitWeightGrams) || unitWeightGrams <= 0) return null;
  return (value * 100) / unitWeightGrams;
}

export function sumMacros(entries: MacroBreakdown[]): MacroBreakdown {
  return entries.reduce(
    (acc, m) => ({
      energyKcal: acc.energyKcal + m.energyKcal,
      proteins: acc.proteins + m.proteins,
      carbohydrates: acc.carbohydrates + m.carbohydrates,
      sugars: acc.sugars + m.sugars,
      fat: acc.fat + m.fat,
      saturatedFat: acc.saturatedFat + m.saturatedFat,
      fiber: acc.fiber + m.fiber,
      salt: acc.salt + m.salt,
    }),
    {
      energyKcal: 0,
      proteins: 0,
      carbohydrates: 0,
      sugars: 0,
      fat: 0,
      saturatedFat: 0,
      fiber: 0,
      salt: 0,
    }
  );
}
