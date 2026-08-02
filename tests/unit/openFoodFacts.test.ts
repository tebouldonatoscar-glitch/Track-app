import { describe, expect, it, vi } from "vitest";
import {
  fetchProductByBarcode,
  isValidBarcode,
  parseOpenFoodFactsProduct,
  type OpenFoodFactsRawProduct,
} from "@/lib/api/openFoodFacts";

const rawNutella: OpenFoodFactsRawProduct = {
  product_name: "Nutella",
  brands: "Ferrero,Autre marque",
  image_front_url: "https://images.example/nutella.jpg",
  nutriscore_grade: "e",
  nova_group: 4,
  ingredients_text: "Sucre, huile de palme, noisettes 13%...",
  allergens: "en:milk,en:nuts",
  additives_tags: ["e322", "e500"],
  serving_size: "15 g",
  nutriments: {
    "energy-kcal_100g": 539,
    proteins_100g: 6.3,
    carbohydrates_100g: 57.5,
    sugars_100g: 56.3,
    fat_100g: 30.9,
    "saturated-fat_100g": 10.6,
    fiber_100g: 0,
    salt_100g: 0.107,
  },
};

describe("isValidBarcode", () => {
  it("accepts 8-14 digit barcodes (EAN/UPC range)", () => {
    expect(isValidBarcode("3017620422003")).toBe(true);
    expect(isValidBarcode("12345678")).toBe(true);
  });

  it("rejects non-numeric or wrong-length input", () => {
    expect(isValidBarcode("abc")).toBe(false);
    expect(isValidBarcode("123")).toBe(false);
    expect(isValidBarcode("")).toBe(false);
    expect(isValidBarcode("123456789012345")).toBe(false);
  });
});

describe("parseOpenFoodFactsProduct", () => {
  it("maps Open Food Facts fields to our Product shape", () => {
    const product = parseOpenFoodFactsProduct("3017620422003", rawNutella);
    expect(product.name).toBe("Nutella");
    expect(product.brand).toBe("Ferrero");
    expect(product.nutriScore).toBe("e");
    expect(product.novaGroup).toBe(4);
    expect(product.allergens).toEqual(["milk", "nuts"]);
    expect(product.additivesCount).toBe(2);
    expect(product.nutrients.energyKcal).toBe(539);
    expect(product.nutrients.proteins).toBe(6.3);
    expect(product.source).toBe("openfoodfacts");
  });

  it("falls back to a placeholder name and unknown grades when fields are missing", () => {
    const product = parseOpenFoodFactsProduct("00000000", {});
    expect(product.name).toBe("Produit sans nom");
    expect(product.nutriScore).toBe("unknown");
    expect(product.novaGroup).toBeNull();
    expect(product.nutrients.energyKcal).toBeNull();
    expect(product.allergens).toEqual([]);
  });

  it("treats invalid nutriscore strings as unknown rather than crashing", () => {
    const product = parseOpenFoodFactsProduct("1", { nutriscore_grade: "z" });
    expect(product.nutriScore).toBe("unknown");
  });
});

describe("fetchProductByBarcode", () => {
  it("returns invalid_barcode without calling fetch for malformed input", async () => {
    const fetchMock = vi.fn();
    const result = await fetchProductByBarcode("abc", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "invalid_barcode" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns network_error when fetch throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await fetchProductByBarcode("3017620422003", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "network_error" });
  });

  it("returns not_found for a 404 response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    const result = await fetchProductByBarcode("3017620422003", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "not_found" });
  });

  it("returns not_found when the API responds with status: 0 (product missing)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 0 }),
    });
    const result = await fetchProductByBarcode("3017620422003", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "not_found" });
  });

  it("returns a parsed product on a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 1, product: rawNutella }),
    });
    const result = await fetchProductByBarcode("3017620422003", fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.name).toBe("Nutella");
      expect(result.product.barcode).toBe("3017620422003");
    }
  });

  it("returns unknown_error when the response body is not valid JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("bad json");
      },
    });
    const result = await fetchProductByBarcode("3017620422003", fetchMock as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, error: "unknown_error" });
  });
});
