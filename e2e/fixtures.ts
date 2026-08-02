import type { Page } from "@playwright/test";

export const MOCK_BARCODE = "3017620422003";

export const MOCK_OFF_RESPONSE = {
  status: 1,
  product: {
    product_name: "Nutella",
    brands: "Ferrero",
    image_front_url: "https://images.openfoodfacts.org/images/products/mock/front.jpg",
    nutriscore_grade: "e",
    nova_group: 4,
    ingredients_text: "Sucre, huile de palme, noisettes 13%, cacao maigre 7.4%...",
    allergens: "en:milk,en:nuts",
    additives_tags: ["en:e322", "en:e500"],
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
  },
};

export const MOCK_OFF_RESPONSE_HEALTHY = {
  status: 1,
  product: {
    product_name: "Blanc de poulet",
    brands: "Marque Bio",
    image_front_url: null,
    nutriscore_grade: "a",
    nova_group: 1,
    ingredients_text: "Blanc de poulet 100%",
    allergens: "",
    additives_tags: [],
    serving_size: "100 g",
    nutriments: {
      "energy-kcal_100g": 110,
      proteins_100g: 23,
      carbohydrates_100g: 0,
      sugars_100g: 0,
      fat_100g: 1.5,
      "saturated-fat_100g": 0.4,
      fiber_100g: 0,
      salt_100g: 0.15,
    },
  },
};

export async function mockOffProduct(page: Page, barcode: string, response: unknown, status = 200) {
  await page.route(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, (route) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(response) })
  );
}

export async function mockOffNotFound(page: Page, barcode: string) {
  await page.route(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, (route) =>
    route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ status: 0 }) })
  );
}

export async function mockOffNetworkError(page: Page, barcode: string) {
  await page.route(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, (route) =>
    route.abort("internetdisconnected")
  );
}
