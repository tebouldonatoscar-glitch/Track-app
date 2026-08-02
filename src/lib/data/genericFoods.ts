import type { NovaGroup, NutriScoreGrade, NutrientsPer100g, Product } from "@/lib/types/product";

export type FoodCategory = "Fruits" | "Légumes" | "Œufs & laitages" | "Féculents" | "Légumineuses & noix";

export interface BuiltinFood {
  category: FoodCategory;
  product: Product;
}

interface RawEntry {
  slug: string;
  name: string;
  category: FoodCategory;
  nutriScore?: NutriScoreGrade;
  novaGroup: NovaGroup;
  nutrients: NutrientsPer100g;
  unitLabel?: string;
  unitWeightGrams?: number;
}

/** Prefix keeps these ids distinct from real EAN/UPC barcodes and from user-generated "generic-*" ids. */
export const BUILTIN_FOOD_ID_PREFIX = "builtin-";

function n(
  energyKcal: number,
  proteins: number,
  carbohydrates: number,
  sugars: number,
  fat: number,
  saturatedFat: number,
  fiber: number,
  salt: number
): NutrientsPer100g {
  return { energyKcal, proteins, carbohydrates, sugars, fat, saturatedFat, fiber, salt };
}

const RAW_ENTRIES: RawEntry[] = [
  // Fruits
  { slug: "pomme", name: "Pomme", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(52, 0.3, 14, 10, 0.2, 0, 2.4, 0), unitLabel: "pomme", unitWeightGrams: 182 },
  { slug: "banane", name: "Banane", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(89, 1.1, 23, 12, 0.3, 0.1, 2.6, 0), unitLabel: "banane", unitWeightGrams: 118 },
  { slug: "orange", name: "Orange", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(47, 0.9, 12, 9, 0.1, 0, 2.4, 0), unitLabel: "orange", unitWeightGrams: 131 },
  { slug: "poire", name: "Poire", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(57, 0.4, 15, 10, 0.1, 0, 3.1, 0), unitLabel: "poire", unitWeightGrams: 178 },
  { slug: "fraise", name: "Fraise", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(32, 0.7, 7.7, 4.9, 0.3, 0, 2, 0) },
  { slug: "raisin", name: "Raisin", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(69, 0.7, 18, 16, 0.2, 0.1, 0.9, 0) },
  { slug: "pasteque", name: "Pastèque", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(30, 0.6, 8, 6, 0.2, 0, 0.4, 0) },
  { slug: "kiwi", name: "Kiwi", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(61, 1.1, 15, 9, 0.5, 0, 3, 0), unitLabel: "kiwi", unitWeightGrams: 76 },
  { slug: "ananas", name: "Ananas", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(50, 0.5, 13, 10, 0.1, 0, 1.4, 0) },
  { slug: "mangue", name: "Mangue", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(60, 0.8, 15, 14, 0.4, 0.1, 1.6, 0) },
  { slug: "avocat", name: "Avocat", category: "Fruits", nutriScore: "b", novaGroup: 1, nutrients: n(160, 2, 8.5, 0.7, 15, 2.1, 6.7, 0.007), unitLabel: "avocat", unitWeightGrams: 200 },
  { slug: "citron", name: "Citron", category: "Fruits", nutriScore: "a", novaGroup: 1, nutrients: n(29, 1.1, 9, 2.5, 0.3, 0, 2.8, 0) },

  // Légumes
  { slug: "tomate", name: "Tomate", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(18, 0.9, 3.9, 2.6, 0.2, 0, 1.2, 0.005), unitLabel: "tomate", unitWeightGrams: 123 },
  { slug: "carotte", name: "Carotte", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(41, 0.9, 10, 4.7, 0.2, 0, 2.8, 0.07), unitLabel: "carotte", unitWeightGrams: 61 },
  { slug: "brocoli", name: "Brocoli", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(34, 2.8, 6.6, 1.7, 0.4, 0, 2.6, 0.03) },
  { slug: "courgette", name: "Courgette", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(17, 1.2, 3.1, 2.5, 0.3, 0.1, 1, 0.008) },
  { slug: "poivron", name: "Poivron", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(31, 1, 6, 4.2, 0.3, 0, 2.1, 0.004) },
  { slug: "epinard", name: "Épinard", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(23, 2.9, 3.6, 0.4, 0.4, 0.1, 2.2, 0.079) },
  { slug: "oignon", name: "Oignon", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(40, 1.1, 9.3, 4.2, 0.1, 0, 1.7, 0.004), unitLabel: "oignon", unitWeightGrams: 110 },
  { slug: "ail", name: "Ail", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(149, 6.4, 33, 1, 0.5, 0.1, 2.1, 0.017), unitLabel: "gousse", unitWeightGrams: 3 },
  { slug: "pomme-de-terre", name: "Pomme de terre", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(77, 2, 17, 0.8, 0.1, 0, 2.2, 0.006), unitLabel: "pomme de terre", unitWeightGrams: 150 },
  { slug: "salade", name: "Salade verte", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(15, 1.4, 2.9, 0.8, 0.2, 0, 1.3, 0.028) },
  { slug: "concombre", name: "Concombre", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(15, 0.7, 3.6, 1.7, 0.1, 0, 0.5, 0.002) },
  { slug: "champignon", name: "Champignon de Paris", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(22, 3.1, 3.3, 2, 0.3, 0, 1, 0.005) },
  { slug: "haricot-vert", name: "Haricot vert", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(31, 1.8, 7, 3.3, 0.2, 0, 3.4, 0.006) },
  { slug: "aubergine", name: "Aubergine", category: "Légumes", nutriScore: "a", novaGroup: 1, nutrients: n(25, 1, 6, 3.5, 0.2, 0, 3, 0.002) },

  // Œufs & laitages
  { slug: "oeuf", name: "Œuf", category: "Œufs & laitages", novaGroup: 1, nutrients: n(143, 12.6, 0.7, 0.4, 9.5, 3.1, 0, 0.29), unitLabel: "œuf", unitWeightGrams: 53 },
  { slug: "lait-entier", name: "Lait entier", category: "Œufs & laitages", novaGroup: 1, nutrients: n(61, 3.2, 4.8, 4.8, 3.3, 1.9, 0, 0.1) },
  { slug: "lait-demi-ecreme", name: "Lait demi-écrémé", category: "Œufs & laitages", novaGroup: 1, nutrients: n(46, 3.3, 4.9, 4.9, 1.6, 1, 0, 0.1) },
  { slug: "yaourt-nature", name: "Yaourt nature", category: "Œufs & laitages", novaGroup: 1, nutrients: n(61, 3.5, 4.7, 4.7, 3.3, 2.1, 0, 0.1), unitLabel: "pot", unitWeightGrams: 125 },
  { slug: "fromage-blanc", name: "Fromage blanc", category: "Œufs & laitages", novaGroup: 1, nutrients: n(60, 7.5, 4, 4, 1.2, 0.8, 0, 0.1) },
  { slug: "beurre", name: "Beurre", category: "Œufs & laitages", novaGroup: 2, nutrients: n(717, 0.9, 0.1, 0.1, 81, 51, 0, 1.3) },

  // Féculents
  { slug: "riz-cru", name: "Riz blanc (cru)", category: "Féculents", novaGroup: 1, nutrients: n(349, 6.7, 78, 0.1, 0.6, 0.1, 1.3, 0.005) },
  { slug: "riz-cuit", name: "Riz blanc (cuit)", category: "Féculents", novaGroup: 1, nutrients: n(130, 2.4, 28, 0.1, 0.3, 0.1, 0.4, 0.001) },
  { slug: "pates-crues", name: "Pâtes (crues)", category: "Féculents", novaGroup: 1, nutrients: n(371, 13, 75, 2.7, 1.5, 0.3, 3.2, 0.006) },
  { slug: "pates-cuites", name: "Pâtes (cuites)", category: "Féculents", novaGroup: 1, nutrients: n(131, 5, 25, 0.6, 1.1, 0.2, 1.8, 0.001) },
  { slug: "farine-de-ble", name: "Farine de blé", category: "Féculents", novaGroup: 1, nutrients: n(364, 10, 76, 0.3, 1, 0.2, 2.7, 0.002) },
  { slug: "pain", name: "Pain", category: "Féculents", novaGroup: 3, nutrients: n(265, 9, 49, 4, 3.2, 0.7, 2.7, 1.2), unitLabel: "tranche", unitWeightGrams: 30 },
  { slug: "flocons-avoine", name: "Flocons d'avoine", category: "Féculents", nutriScore: "a", novaGroup: 1, nutrients: n(389, 16.9, 66, 1, 6.9, 1.2, 10.6, 0.002) },
  { slug: "quinoa-cuit", name: "Quinoa (cuit)", category: "Féculents", nutriScore: "a", novaGroup: 1, nutrients: n(120, 4.4, 21, 0.9, 1.9, 0.2, 2.8, 0.007) },

  // Légumineuses & noix
  { slug: "lentilles-cuites", name: "Lentilles (cuites)", category: "Légumineuses & noix", nutriScore: "a", novaGroup: 1, nutrients: n(116, 9, 20, 1.8, 0.4, 0.1, 7.9, 0.002) },
  { slug: "pois-chiches-cuits", name: "Pois chiches (cuits)", category: "Légumineuses & noix", nutriScore: "a", novaGroup: 1, nutrients: n(164, 8.9, 27, 4.8, 2.6, 0.3, 7.6, 0.007) },
  { slug: "haricots-rouges-cuits", name: "Haricots rouges (cuits)", category: "Légumineuses & noix", nutriScore: "a", novaGroup: 1, nutrients: n(127, 8.7, 22.8, 0.3, 0.5, 0.1, 6.4, 0.002) },
  { slug: "amande", name: "Amande", category: "Légumineuses & noix", novaGroup: 1, nutrients: n(579, 21, 22, 4.4, 50, 3.8, 12.5, 0.001) },
  { slug: "noix", name: "Noix", category: "Légumineuses & noix", novaGroup: 1, nutrients: n(654, 15, 14, 2.6, 65, 6.1, 6.7, 0.002) },
];

export const BUILTIN_FOODS: BuiltinFood[] = RAW_ENTRIES.map((entry) => ({
  category: entry.category,
  product: {
    barcode: `${BUILTIN_FOOD_ID_PREFIX}${entry.slug}`,
    name: entry.name,
    brand: null,
    imageUrl: null,
    nutriScore: entry.nutriScore ?? "unknown",
    novaGroup: entry.novaGroup,
    ingredientsText: null,
    allergens: [],
    additivesCount: 0,
    nutrients: entry.nutrients,
    servingSize: null,
    source: "manual",
    unitLabel: entry.unitLabel ?? null,
    unitWeightGrams: entry.unitWeightGrams ?? null,
  },
}));

export function findBuiltinFood(id: string): Product | undefined {
  return BUILTIN_FOODS.find((f) => f.product.barcode === id)?.product;
}

export function isBuiltinFoodId(id: string): boolean {
  return id.startsWith(BUILTIN_FOOD_ID_PREFIX);
}
