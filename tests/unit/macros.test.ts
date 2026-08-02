import { describe, expect, it } from "vitest";
import {
  calculateMacrosForQuantity,
  hasCompleteNutrientData,
  isValidQuantity,
  proteinCalorieRatio,
  sumMacros,
} from "@/lib/macros/calculate";
import type { NutrientsPer100g } from "@/lib/types/product";

const fullNutrients: NutrientsPer100g = {
  energyKcal: 200,
  proteins: 20,
  carbohydrates: 10,
  sugars: 5,
  fat: 8,
  saturatedFat: 2,
  fiber: 3,
  salt: 1.2,
};

describe("calculateMacrosForQuantity", () => {
  it("scales per-100g values linearly for a given quantity", () => {
    const result = calculateMacrosForQuantity(fullNutrients, 150);
    expect(result.energyKcal).toBe(300);
    expect(result.proteins).toBe(30);
    expect(result.carbohydrates).toBe(15);
    expect(result.fat).toBe(12);
    expect(result.salt).toBe(1.8);
  });

  it("returns zeros for a 0g quantity", () => {
    const result = calculateMacrosForQuantity(fullNutrients, 0);
    expect(result.energyKcal).toBe(0);
    expect(result.proteins).toBe(0);
  });

  it("treats negative or NaN quantity as zero instead of throwing", () => {
    expect(() => calculateMacrosForQuantity(fullNutrients, -50)).not.toThrow();
    expect(calculateMacrosForQuantity(fullNutrients, -50).energyKcal).toBe(0);
    expect(calculateMacrosForQuantity(fullNutrients, NaN).energyKcal).toBe(0);
  });

  it("treats missing (null) nutrients as zero in the output", () => {
    const partial: NutrientsPer100g = { ...fullNutrients, fiber: null, salt: null };
    const result = calculateMacrosForQuantity(partial, 100);
    expect(result.fiber).toBe(0);
    expect(result.salt).toBe(0);
  });

  it("rounds to a sensible number of decimals", () => {
    const nutrients: NutrientsPer100g = { ...fullNutrients, proteins: 33.333 };
    const result = calculateMacrosForQuantity(nutrients, 33);
    expect(result.proteins).toBeCloseTo(11, 1);
  });
});

describe("hasCompleteNutrientData", () => {
  it("returns true when core nutrients are present", () => {
    expect(hasCompleteNutrientData(fullNutrients)).toBe(true);
  });

  it("returns false when a core nutrient is missing", () => {
    expect(hasCompleteNutrientData({ ...fullNutrients, proteins: null })).toBe(false);
  });
});

describe("proteinCalorieRatio", () => {
  it("computes the percentage of calories coming from protein", () => {
    const macros = calculateMacrosForQuantity(fullNutrients, 100);
    // 20g protein * 4 kcal/g = 80 kcal out of 200 kcal = 40%
    expect(proteinCalorieRatio(macros)).toBe(40);
  });

  it("returns null when there are no calories to divide by", () => {
    const macros = calculateMacrosForQuantity(fullNutrients, 0);
    expect(proteinCalorieRatio(macros)).toBeNull();
  });
});

describe("isValidQuantity", () => {
  it("accepts positive quantities within range", () => {
    expect(isValidQuantity(100)).toBe(true);
    expect(isValidQuantity(0.5)).toBe(true);
  });

  it("rejects zero, negative, NaN, or excessive quantities", () => {
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(-10)).toBe(false);
    expect(isValidQuantity(NaN)).toBe(false);
    expect(isValidQuantity(10000)).toBe(false);
  });
});

describe("sumMacros", () => {
  it("sums multiple macro breakdowns field by field", () => {
    const a = calculateMacrosForQuantity(fullNutrients, 100);
    const b = calculateMacrosForQuantity(fullNutrients, 50);
    const total = sumMacros([a, b]);
    expect(total.energyKcal).toBe(300);
    expect(total.proteins).toBe(30);
  });

  it("returns all zeros for an empty list", () => {
    const total = sumMacros([]);
    expect(total.energyKcal).toBe(0);
    expect(total.salt).toBe(0);
  });
});
