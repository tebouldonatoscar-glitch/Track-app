import { describe, expect, it } from "vitest";
import { computeMacroScore } from "@/lib/scoring/macroScore";
import type { NutrientsPer100g } from "@/lib/types/product";

const pomme: NutrientsPer100g = {
  energyKcal: 52,
  proteins: 0.3,
  carbohydrates: 14,
  sugars: 10,
  fat: 0.2,
  saturatedFat: 0,
  fiber: 2.4,
  salt: 0,
};

const beurre: NutrientsPer100g = {
  energyKcal: 717,
  proteins: 0.9,
  carbohydrates: 0.1,
  sugars: 0.1,
  fat: 81,
  saturatedFat: 51,
  fiber: 0,
  salt: 1.3,
};

const sucre: NutrientsPer100g = {
  energyKcal: 400,
  proteins: 0,
  carbohydrates: 100,
  sugars: 100,
  fat: 0,
  saturatedFat: 0,
  fiber: 0,
  salt: 0,
};

describe("computeMacroScore", () => {
  it("gives a high score to a low-calorie, high-fiber fruit", () => {
    const result = computeMacroScore(pomme);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.label).toBe("excellent");
  });

  it("never anchors on a neutral base: an all-null nutrient profile scores 100", () => {
    const empty: NutrientsPer100g = {
      energyKcal: null,
      proteins: null,
      carbohydrates: null,
      sugars: null,
      fat: null,
      saturatedFat: null,
      fiber: null,
      salt: null,
    };
    expect(computeMacroScore(empty).score).toBe(100);
  });

  it("penalizes calorie-dense, high-saturated-fat, salty food heavily", () => {
    const result = computeMacroScore(beurre);
    expect(result.score).toBeLessThan(40);
  });

  it("penalizes near-pure sugar even with moderate calories", () => {
    const result = computeMacroScore(sucre);
    expect(result.score).toBeLessThan(50);
  });

  it("rewards protein and fiber content", () => {
    const base = computeMacroScore(pomme);
    const withMoreFiber = computeMacroScore({ ...pomme, fiber: 8 });
    expect(withMoreFiber.score).toBeGreaterThan(base.score);
  });

  it("clamps the score between 0 and 100", () => {
    const worst: NutrientsPer100g = {
      energyKcal: 900,
      proteins: 0,
      carbohydrates: 100,
      sugars: 100,
      fat: 100,
      saturatedFat: 100,
      fiber: 0,
      salt: 10,
    };
    const result = computeMacroScore(worst);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("includes reasons only for factors that actually apply", () => {
    const result = computeMacroScore(pomme);
    expect(result.reasons.some((r) => r.includes("Sel"))).toBe(false);
    expect(result.reasons.some((r) => r.includes("Fibres"))).toBe(true);
  });

  it("rounds nutrient values in reasons instead of showing raw floating-point noise", () => {
    // 35g sugar over a 330ml drink -> 10.606060606060606g/100ml pre-rounding
    const repeatingDecimal = (35 * 100) / 330;
    const result = computeMacroScore({ ...pomme, sugars: repeatingDecimal });
    const sugarReason = result.reasons.find((r) => r.includes("Sucres"));
    expect(sugarReason).toBeDefined();
    expect(sugarReason).not.toMatch(/\d+\.\d{3,}/);
  });
});
