import type { MacroBreakdown, NutrientsPer100g, Recipe } from "@/lib/types/product";
import { calculateMacrosForQuantity, sumMacros } from "@/lib/macros/calculate";
import { roundTo } from "@/lib/utils/round";

/** Rounds each macro field to the precision used throughout the app: whole kcal, 1dp for macros, 2dp for salt. */
function roundMacros(macros: MacroBreakdown): MacroBreakdown {
  return {
    energyKcal: roundTo(macros.energyKcal, 0),
    proteins: roundTo(macros.proteins, 1),
    carbohydrates: roundTo(macros.carbohydrates, 1),
    sugars: roundTo(macros.sugars, 1),
    fat: roundTo(macros.fat, 1),
    saturatedFat: roundTo(macros.saturatedFat, 1),
    fiber: roundTo(macros.fiber, 1),
    salt: roundTo(macros.salt, 2),
  };
}

function scaleMacros(macros: MacroBreakdown, factor: number): MacroBreakdown {
  return roundMacros({
    energyKcal: macros.energyKcal * factor,
    proteins: macros.proteins * factor,
    carbohydrates: macros.carbohydrates * factor,
    sugars: macros.sugars * factor,
    fat: macros.fat * factor,
    saturatedFat: macros.saturatedFat * factor,
    fiber: macros.fiber * factor,
    salt: macros.salt * factor,
  });
}

export function recipeTotalWeightGrams(recipe: Recipe): number {
  return recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.quantityGrams, 0);
}

export function computeRecipeTotalMacros(recipe: Recipe): MacroBreakdown {
  const total = sumMacros(
    recipe.ingredients.map((ingredient) => calculateMacrosForQuantity(ingredient.nutrients, ingredient.quantityGrams))
  );
  return roundMacros(total);
}

/** Macros for an arbitrary number of servings logged from this recipe (e.g. 2 servings eaten). */
export function computeRecipeMacrosForServings(recipe: Recipe, servings: number): MacroBreakdown {
  const total = computeRecipeTotalMacros(recipe);
  const factor = recipe.servings > 0 ? servings / recipe.servings : 0;
  return scaleMacros(total, factor);
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
  return scaleMacros(total, factor);
}
