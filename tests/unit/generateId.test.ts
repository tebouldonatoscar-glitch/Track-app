import { describe, expect, it } from "vitest";
import { generateManualProductId } from "@/lib/storage/generateId";
import { isValidBarcode } from "@/lib/api/openFoodFacts";

describe("generateManualProductId", () => {
  it("produces a slug derived from the product name", () => {
    const id = generateManualProductId("Farine T55");
    expect(id).toMatch(/^generic-farine-t55-/);
  });

  it("never collides with a real EAN/UPC barcode format", () => {
    const id = generateManualProductId("Oeuf");
    expect(isValidBarcode(id)).toBe(false);
  });

  it("produces distinct ids for repeated calls with the same name", () => {
    const a = generateManualProductId("Oeuf");
    const b = generateManualProductId("Oeuf");
    expect(a).not.toBe(b);
  });

  it("falls back to a generic slug for names with no ASCII letters", () => {
    const id = generateManualProductId("🥚");
    expect(id).toMatch(/^generic-produit-/);
  });
});
