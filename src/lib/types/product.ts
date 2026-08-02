export type NutriScoreGrade = "a" | "b" | "c" | "d" | "e" | "unknown";
export type NovaGroup = 1 | 2 | 3 | 4 | null;

export interface NutrientsPer100g {
  energyKcal: number | null;
  proteins: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  fat: number | null;
  saturatedFat: number | null;
  fiber: number | null;
  salt: number | null;
}

export interface Product {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  nutriScore: NutriScoreGrade;
  novaGroup: NovaGroup;
  ingredientsText: string | null;
  allergens: string[];
  additivesCount: number;
  nutrients: NutrientsPer100g;
  servingSize: string | null;
  source: "openfoodfacts" | "manual";
  /** Label for one discrete unit of this product, e.g. "œuf", "tranche". Null for products only measured by weight. */
  unitLabel: string | null;
  /** Average weight in grams of one unit, used to convert a unit count into grams for macro calculations. */
  unitWeightGrams: number | null;
}

export interface MacroBreakdown {
  energyKcal: number;
  proteins: number;
  carbohydrates: number;
  sugars: number;
  fat: number;
  saturatedFat: number;
  fiber: number;
  salt: number;
}

export interface HomemadeScore {
  score: number; // 0-100, higher is better
  label: "excellent" | "bon" | "moyen" | "mediocre" | "mauvais";
  reasons: string[];
}

export interface HistoryEntry {
  id: string;
  barcode: string;
  productName: string;
  brand: string | null;
  imageUrl: string | null;
  quantityGrams: number;
  macros: MacroBreakdown;
  nutriScore: NutriScoreGrade;
  novaGroup: NovaGroup;
  timestamp: number;
}

export interface FavoriteProduct {
  barcode: string;
  productName: string;
  brand: string | null;
  imageUrl: string | null;
  nutriScore: NutriScoreGrade;
  novaGroup: NovaGroup;
  addedAt: number;
}

export interface DailyGoals {
  energyKcal: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
}

export interface RecipeIngredient {
  barcode: string;
  name: string;
  quantityGrams: number;
  /** Snapshot of the source product's per-100g nutrients, so the recipe keeps working even if that product changes later. */
  nutrients: NutrientsPer100g;
}

export interface Recipe {
  id: string;
  name: string;
  /** Number of servings the whole ingredient list yields, used to compute per-serving macros. */
  servings: number;
  ingredients: RecipeIngredient[];
  createdAt: number;
}
