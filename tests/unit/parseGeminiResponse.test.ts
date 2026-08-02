import { describe, expect, it } from "vitest";
import { parseGeminiEstimateJson } from "@/lib/ai/parseGeminiResponse";

const VALID_JSON = JSON.stringify({
  dishName: "Bol de riz au poulet",
  estimatedTotalWeightGrams: 350,
  energyKcal: 520,
  proteins: 35,
  carbohydrates: 60,
  sugars: 4,
  fat: 12,
  saturatedFat: 3,
  fiber: 5,
  salt: 1.2,
  confidenceNote: "Portion standard supposée.",
});

describe("parseGeminiEstimateJson", () => {
  it("parses a well-formed response", () => {
    const estimate = parseGeminiEstimateJson(VALID_JSON);
    expect(estimate).not.toBeNull();
    expect(estimate?.dishName).toBe("Bol de riz au poulet");
    expect(estimate?.estimatedTotalWeightGrams).toBe(350);
    expect(estimate?.macros.energyKcal).toBe(520);
    expect(estimate?.macros.proteins).toBe(35);
    expect(estimate?.confidenceNote).toBe("Portion standard supposée.");
  });

  it("returns null for invalid JSON", () => {
    expect(parseGeminiEstimateJson("not json")).toBeNull();
  });

  it("returns null when energyKcal is missing or not a number", () => {
    expect(parseGeminiEstimateJson(JSON.stringify({ dishName: "Plat" }))).toBeNull();
    expect(parseGeminiEstimateJson(JSON.stringify({ dishName: "Plat", energyKcal: "beaucoup" }))).toBeNull();
  });

  it("defaults missing optional numeric fields to 0 instead of throwing", () => {
    const estimate = parseGeminiEstimateJson(JSON.stringify({ energyKcal: 300 }));
    expect(estimate).not.toBeNull();
    expect(estimate?.macros.proteins).toBe(0);
    expect(estimate?.macros.salt).toBe(0);
  });

  it("clamps negative nutrient values to 0", () => {
    const estimate = parseGeminiEstimateJson(JSON.stringify({ energyKcal: 300, proteins: -5 }));
    expect(estimate?.macros.proteins).toBe(0);
  });

  it("falls back to a generic dish name and null weight when unset", () => {
    const estimate = parseGeminiEstimateJson(JSON.stringify({ energyKcal: 100, estimatedTotalWeightGrams: -1 }));
    expect(estimate?.dishName).toBe("Plat estimé");
    expect(estimate?.estimatedTotalWeightGrams).toBeNull();
  });

  it("ignores a non-string confidenceNote rather than failing", () => {
    const estimate = parseGeminiEstimateJson(JSON.stringify({ energyKcal: 100, confidenceNote: 42 }));
    expect(estimate?.confidenceNote).toBeNull();
  });
});
