import { describe, expect, it } from "vitest";
import {
  computeRecipeMacrosForServings,
  computeRecipePerServingMacros,
  computeRecipeTotalMacros,
  recipeNutrientsPer100g,
  recipeTotalWeightGrams,
} from "@/lib/recipes/calculate";
import type { NutrientsPer100g, Recipe } from "@/lib/types/product";

const chicken: NutrientsPer100g = {
  energyKcal: 110,
  proteins: 23,
  carbohydrates: 0,
  sugars: 0,
  fat: 1.6,
  saturatedFat: 0.4,
  fiber: 0,
  salt: 0.18,
};

const rice: NutrientsPer100g = {
  energyKcal: 130,
  proteins: 2.4,
  carbohydrates: 28,
  sugars: 0.1,
  fat: 0.3,
  saturatedFat: 0.1,
  fiber: 0.4,
  salt: 0.001,
};

const recipe: Recipe = {
  id: "recipe-test",
  name: "Poulet-riz",
  servings: 2,
  ingredients: [
    { barcode: "builtin-poulet-blanc-cru", name: "Poulet (blanc, cru)", quantityGrams: 200, nutrients: chicken },
    { barcode: "builtin-riz-cuit", name: "Riz blanc (cuit)", quantityGrams: 300, nutrients: rice },
  ],
  createdAt: 0,
};

describe("recipeTotalWeightGrams", () => {
  it("sums the quantity of every ingredient", () => {
    expect(recipeTotalWeightGrams(recipe)).toBe(500);
  });
});

describe("computeRecipeTotalMacros", () => {
  it("sums each ingredient's scaled macros", () => {
    const total = computeRecipeTotalMacros(recipe);
    // 200g chicken @110kcal/100g = 220, 300g rice @130kcal/100g = 390 -> 610
    expect(total.energyKcal).toBe(610);
    expect(total.proteins).toBeCloseTo(23 * 2 + 2.4 * 3, 1);
  });
});

describe("computeRecipePerServingMacros", () => {
  it("divides the total macros by the number of servings", () => {
    const perServing = computeRecipePerServingMacros(recipe);
    expect(perServing.energyKcal).toBe(305);
  });
});

describe("computeRecipeMacrosForServings", () => {
  it("scales the total macros proportionally to the servings requested", () => {
    const forOneServing = computeRecipeMacrosForServings(recipe, 1);
    const forAllServings = computeRecipeMacrosForServings(recipe, 2);
    expect(forOneServing.energyKcal).toBe(305);
    expect(forAllServings.energyKcal).toBe(610);
  });

  it("returns zeros when the recipe has no servings defined", () => {
    const brokenRecipe: Recipe = { ...recipe, servings: 0 };
    const result = computeRecipeMacrosForServings(brokenRecipe, 1);
    expect(result.energyKcal).toBe(0);
  });
});

describe("recipeNutrientsPer100g", () => {
  it("expresses the whole recipe's nutrient density per 100g", () => {
    const per100g = recipeNutrientsPer100g(recipe);
    // 610 kcal over 500g total -> 122 kcal/100g
    expect(per100g.energyKcal).toBe(122);
  });

  it("returns all zeros for a recipe with no ingredients", () => {
    const empty: Recipe = { ...recipe, ingredients: [] };
    const per100g = recipeNutrientsPer100g(empty);
    expect(per100g.energyKcal).toBe(0);
  });
});
