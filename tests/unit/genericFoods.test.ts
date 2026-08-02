import { describe, expect, it } from "vitest";
import { BUILTIN_FOODS, findBuiltinFood, isBuiltinFoodId } from "@/lib/data/genericFoods";
import { isValidBarcode } from "@/lib/api/openFoodFacts";

describe("BUILTIN_FOODS", () => {
  it("has a reasonable number of curated entries", () => {
    expect(BUILTIN_FOODS.length).toBeGreaterThanOrEqual(30);
  });

  it("has a unique barcode-like id for every entry", () => {
    const ids = BUILTIN_FOODS.map((f) => f.product.barcode);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never uses ids that look like real EAN/UPC barcodes", () => {
    for (const { product } of BUILTIN_FOODS) {
      expect(isValidBarcode(product.barcode)).toBe(false);
      expect(isBuiltinFoodId(product.barcode)).toBe(true);
    }
  });

  it("has non-negative, finite nutrient values for every entry", () => {
    for (const { product } of BUILTIN_FOODS) {
      for (const value of Object.values(product.nutrients)) {
        expect(value).not.toBeNull();
        expect(Number.isFinite(value)).toBe(true);
        expect(value as number).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("gives a positive unit weight whenever a unit label is set", () => {
    for (const { product } of BUILTIN_FOODS) {
      if (product.unitLabel) {
        expect(product.unitWeightGrams).not.toBeNull();
        expect(product.unitWeightGrams as number).toBeGreaterThan(0);
      }
    }
  });
});

describe("findBuiltinFood", () => {
  it("finds a known food by its id", () => {
    const egg = findBuiltinFood("builtin-oeuf");
    expect(egg?.name).toBe("Œuf");
    expect(egg?.unitLabel).toBe("œuf");
  });

  it("returns undefined for an unknown id", () => {
    expect(findBuiltinFood("builtin-inconnu")).toBeUndefined();
    expect(findBuiltinFood("3017620422003")).toBeUndefined();
  });
});
