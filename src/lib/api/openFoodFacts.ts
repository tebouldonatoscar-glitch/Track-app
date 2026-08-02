import type {
  NovaGroup,
  NutrientsPer100g,
  NutriScoreGrade,
  Product,
} from "@/lib/types/product";

const API_BASE = "https://world.openfoodfacts.org/api/v2/product";

/** Loose shape of the relevant fields from Open Food Facts' product JSON. */
export interface OpenFoodFactsRawProduct {
  product_name?: string;
  product_name_fr?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  nutriscore_grade?: string;
  nutrition_grades?: string;
  nova_group?: number | string;
  ingredients_text?: string;
  ingredients_text_fr?: string;
  allergens?: string;
  additives_tags?: string[];
  serving_size?: string;
  nutriments?: Record<string, number | string | undefined>;
}

export type FetchProductResult =
  | { ok: true; product: Product }
  | { ok: false; error: FetchProductError };

export type FetchProductError =
  | "not_found"
  | "network_error"
  | "invalid_barcode"
  | "unknown_error";

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseNutriScore(raw: unknown): NutriScoreGrade {
  if (typeof raw !== "string") return "unknown";
  const grade = raw.toLowerCase().trim();
  if (grade === "a" || grade === "b" || grade === "c" || grade === "d" || grade === "e") {
    return grade;
  }
  return "unknown";
}

function parseNovaGroup(raw: unknown): NovaGroup {
  const num = toNumberOrNull(raw);
  if (num === 1 || num === 2 || num === 3 || num === 4) return num;
  return null;
}

function parseAllergens(raw: unknown): string[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((a) => a.replace(/^[a-z]{2}:/i, "").trim())
    .filter(Boolean);
}

export function parseOpenFoodFactsProduct(barcode: string, data: OpenFoodFactsRawProduct): Product {
  const nutriments = data?.nutriments ?? {};

  const nutrients: NutrientsPer100g = {
    energyKcal: toNumberOrNull(nutriments["energy-kcal_100g"]),
    proteins: toNumberOrNull(nutriments["proteins_100g"]),
    carbohydrates: toNumberOrNull(nutriments["carbohydrates_100g"]),
    sugars: toNumberOrNull(nutriments["sugars_100g"]),
    fat: toNumberOrNull(nutriments["fat_100g"]),
    saturatedFat: toNumberOrNull(nutriments["saturated-fat_100g"]),
    fiber: toNumberOrNull(nutriments["fiber_100g"]),
    salt: toNumberOrNull(nutriments["salt_100g"]),
  };

  const additives: unknown[] = Array.isArray(data?.additives_tags)
    ? data.additives_tags
    : [];

  return {
    barcode,
    name: (data?.product_name || data?.product_name_fr || "Produit sans nom").trim(),
    brand: typeof data?.brands === "string" && data.brands.trim() !== "" ? data.brands.split(",")[0].trim() : null,
    imageUrl: data?.image_front_url || data?.image_url || null,
    nutriScore: parseNutriScore(data?.nutriscore_grade ?? data?.nutrition_grades),
    novaGroup: parseNovaGroup(data?.nova_group),
    ingredientsText: data?.ingredients_text_fr || data?.ingredients_text || null,
    allergens: parseAllergens(data?.allergens),
    additivesCount: additives.length,
    nutrients,
    servingSize: data?.serving_size || null,
    source: "openfoodfacts",
    unitLabel: null,
    unitWeightGrams: null,
  };
}

export function isValidBarcode(barcode: string): boolean {
  return /^\d{8,14}$/.test(barcode.trim());
}

export async function fetchProductByBarcode(
  barcode: string,
  fetchImpl: typeof fetch = fetch
): Promise<FetchProductResult> {
  const trimmed = barcode.trim();
  if (!isValidBarcode(trimmed)) {
    return { ok: false, error: "invalid_barcode" };
  }

  let response: Response;
  try {
    response = await fetchImpl(`${API_BASE}/${trimmed}.json`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    return { ok: false, error: "network_error" };
  }

  if (!response.ok) {
    return { ok: false, error: response.status === 404 ? "not_found" : "unknown_error" };
  }

  let data: { status?: number; product?: OpenFoodFactsRawProduct };
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: "unknown_error" };
  }

  if (data?.status !== 1 || !data?.product) {
    return { ok: false, error: "not_found" };
  }

  try {
    const product = parseOpenFoodFactsProduct(trimmed, data.product);
    return { ok: true, product };
  } catch {
    return { ok: false, error: "unknown_error" };
  }
}
