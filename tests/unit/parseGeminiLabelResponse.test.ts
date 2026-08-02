import { describe, expect, it } from "vitest";
import { parseGeminiLabelJson } from "@/lib/ai/parseGeminiLabelResponse";

const VALID_JSON = JSON.stringify({
  productName: "Soda XYZ",
  energyKcal: 42,
  proteins: 0,
  carbohydrates: 10.6,
  sugars: 10.6,
  fat: 0,
  saturatedFat: 0,
  fiber: 0,
  salt: 0.01,
  confidenceNote: "Valeurs lues directement pour 100ml.",
});

describe("parseGeminiLabelJson", () => {
  it("parses a well-formed response", () => {
    const scan = parseGeminiLabelJson(VALID_JSON);
    expect(scan).not.toBeNull();
    expect(scan?.productName).toBe("Soda XYZ");
    expect(scan?.nutrients.energyKcal).toBe(42);
    expect(scan?.nutrients.sugars).toBe(10.6);
    expect(scan?.confidenceNote).toBe("Valeurs lues directement pour 100ml.");
  });

  it("returns null for invalid JSON", () => {
    expect(parseGeminiLabelJson("not json")).toBeNull();
  });

  it("returns null when energyKcal is missing or not a number", () => {
    expect(parseGeminiLabelJson(JSON.stringify({ productName: "X" }))).toBeNull();
    expect(parseGeminiLabelJson(JSON.stringify({ productName: "X", energyKcal: "beaucoup" }))).toBeNull();
  });

  it("defaults missing optional numeric fields to 0 instead of throwing", () => {
    const scan = parseGeminiLabelJson(JSON.stringify({ energyKcal: 150 }));
    expect(scan).not.toBeNull();
    expect(scan?.nutrients.proteins).toBe(0);
    expect(scan?.nutrients.salt).toBe(0);
  });

  it("clamps negative nutrient values to 0", () => {
    const scan = parseGeminiLabelJson(JSON.stringify({ energyKcal: 150, fat: -3 }));
    expect(scan?.nutrients.fat).toBe(0);
  });

  it("falls back to a null product name when unset or not a string", () => {
    expect(parseGeminiLabelJson(JSON.stringify({ energyKcal: 100 }))?.productName).toBeNull();
    expect(parseGeminiLabelJson(JSON.stringify({ energyKcal: 100, productName: 42 }))?.productName).toBeNull();
  });

  it("ignores a non-string confidenceNote rather than failing", () => {
    const scan = parseGeminiLabelJson(JSON.stringify({ energyKcal: 100, confidenceNote: 42 }));
    expect(scan?.confidenceNote).toBeNull();
  });
});
