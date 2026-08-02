import { describe, expect, it } from "vitest";
import { computeHomemadeScore } from "@/lib/scoring/homemadeScore";
import type { NutrientsPer100g } from "@/lib/types/product";

const neutralNutrients: NutrientsPer100g = {
  energyKcal: 100,
  proteins: 5,
  carbohydrates: 10,
  sugars: 2,
  fat: 3,
  saturatedFat: 1,
  fiber: 1,
  salt: 0.5,
};

describe("computeHomemadeScore", () => {
  it("gives a high score for Nutri-Score A, NOVA 1, low sugar", () => {
    const result = computeHomemadeScore("a", 1, neutralNutrients, 0);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.label).toBe("excellent");
  });

  it("gives a low score for Nutri-Score E, NOVA 4, high sugar, many additives", () => {
    const result = computeHomemadeScore("e", 4, { ...neutralNutrients, sugars: 60 }, 8);
    expect(result.score).toBeLessThan(40);
    expect(["mediocre", "mauvais"]).toContain(result.label);
  });

  it("penalizes ultra-processing (NOVA 4) independently of Nutri-Score", () => {
    const withoutNova = computeHomemadeScore("b", null, neutralNutrients, 0);
    const withNova4 = computeHomemadeScore("b", 4, neutralNutrients, 0);
    expect(withNova4.score).toBeLessThan(withoutNova.score);
  });

  it("rewards high fiber content with a bonus", () => {
    const lowFiber = computeHomemadeScore("c", null, neutralNutrients, 0);
    const highFiber = computeHomemadeScore("c", null, { ...neutralNutrients, fiber: 5 }, 0);
    expect(highFiber.score).toBeGreaterThan(lowFiber.score);
  });

  it("clamps the score between 0 and 100", () => {
    const worst = computeHomemadeScore("e", 4, { ...neutralNutrients, sugars: 90 }, 20);
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.score).toBeLessThanOrEqual(100);
  });

  it("always includes at least one reason (the Nutri-Score base)", () => {
    const result = computeHomemadeScore("unknown", null, neutralNutrients, 0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});
