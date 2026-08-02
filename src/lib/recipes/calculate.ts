import type { MacroBreakdown, NutrientsPer100g, Recipe } from "@/lib/types/product";
import { calculateMacrosForQuantity, sumMacros } from "@/lib/macros/calculate";

export function recipeTotalWeightGrams(recipe: Recipe): number {
  return recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.quantityGrams, 0);
}

export function computeRecipeTotalMacros(recipe: Recipe): MacroBreakdown {
  const total = sumMacros(
    recipe.ingredients.map((ingredient) => calculateMacrosForQuantity(ingredient.nutrients, ingredient.quantityGrams))
  );
  return {
    energyKcal: roundTo(total.energyKcal, 0),
    proteins: roundTo(total.proteins, 1),
    carbohydrates: roundTo(total.carbohydrates, 1),
    sugars: roundTo(total.sugars, 1),
    fat: roundTo(total.fat, 1),
    saturatedFat: roundTo(total.saturatedFat, 1),
    fiber: roundTo(total.fiber, 1),
    salt: roundTo(total.salt, 2),
  };
}

/** Macros for an arbitrary number of servings logged from this recipe (e.g. 2 servings eaten). */
export function computeRecipeMacrosForServings(recipe: Recipe, servings: number): MacroBreakdown {
  const total = computeRecipeTotalMacros(recipe);
  const factor = recipe.servings > 0 ? servings / recipe.servings : 0;
  return {
    energyKcal: roundTo(total.energyKcal * factor, 0),
    proteins: roundTo(total.proteins * factor, 1),
    carbohydrates: roundTo(total.carbohydrates * factor, 1),
    sugars: roundTo(total.sugars * factor, 1),
    fat: roundTo(total.fat * factor, 1),
    saturatedFat: roundTo(total.saturatedFat * factor, 1),
    fiber: roundTo(total.fiber * factor, 1),
    salt: roundTo(total.salt * factor, 2),
  };
}

export function computeRecipePerServingMacros(recipe: Recipe): MacroBreakdown {
  return computeRecipeMacrosForServings(recipe, 1);
}

/** Recipe's overall nutrient density per 100g, so it can be fed into a per-100g score like computeMacroScore. */
export function recipeNutrientsPer100g(recipe: Recipe): NutrientsPer100g {
  const weight = recipeTotalWeightGrams(recipe);
  if (weight <= 0) {
    return { energyKcal: 0, proteins: 0, carbohydrates: 0, sugars: 0, fat: 0, saturatedFat: 0, fiber: 0, salt: 0 };
  }
  const total = computeRecipeTotalMacros(recipe);
  const factor = 100 / weight;
  return {
    energyKcal: roundTo(total.energyKcal * factor, 0),
    proteins: roundTo(total.proteins * factor, 1),
    carbohydrates: roundTo(total.carbohydrates * factor, 1),
    sugars: roundTo(total.sugars * factor, 1),
    fat: roundTo(total.fat * factor, 1),
    saturatedFat: roundTo(total.saturatedFat * factor, 1),
    fiber: roundTo(total.fiber * factor, 1),
    salt: roundTo(total.salt * factor, 2),
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
