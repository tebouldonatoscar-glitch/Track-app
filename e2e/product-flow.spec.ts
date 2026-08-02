import { test, expect } from "@playwright/test";
import { MOCK_BARCODE, MOCK_OFF_RESPONSE, mockOffProduct } from "./fixtures";

test.describe("Scan to macros flow", () => {
  test("shows product info and computes macros for a quantity", async ({ page }) => {
    await mockOffProduct(page, MOCK_BARCODE, MOCK_OFF_RESPONSE);

    await page.goto(`/product?barcode=${MOCK_BARCODE}`);

    await expect(page.getByRole("heading", { name: "Nutella" })).toBeVisible();
    await expect(page.getByText("Ferrero")).toBeVisible();
    await expect(page.getByText("NOVA 4 · Ultra-transformé")).toBeVisible();
    await expect(page.getByText(/Produit ultra-transformé/)).toBeVisible();

    // Default quantity is 100g -> values equal the per-100g values from the mock.
    await expect(page.getByText("539 kcal")).toBeVisible();

    await page.screenshot({ path: "docs/screenshots/02-product-sheet.png", fullPage: true });

    // Switch to 50g and verify macros are recalculated proportionally.
    await page.getByLabel("Quantité (grammes)").fill("50");
    await expect(page.getByText("270 kcal")).toBeVisible();

    // Homemade score card is present with a numeric score.
    await expect(page.getByText(/Score maison/)).toBeVisible();
  });

  test("adds a scanned product to history", async ({ page }) => {
    await mockOffProduct(page, MOCK_BARCODE, MOCK_OFF_RESPONSE);
    await page.goto(`/product?barcode=${MOCK_BARCODE}`);

    await page.getByRole("button", { name: "Ajouter à l'historique" }).click();
    await expect(page.getByText("Ajouté à l'historique !")).toBeVisible();

    await page.goto("/history");
    await expect(page.getByRole("link", { name: "Nutella" })).toBeVisible();
  });

  test("toggles favorite status from the product sheet", async ({ page }) => {
    await mockOffProduct(page, MOCK_BARCODE, MOCK_OFF_RESPONSE);
    await page.goto(`/product?barcode=${MOCK_BARCODE}`);

    const favoriteButton = page.getByRole("button", { name: "Basculer favori" });
    await favoriteButton.click();

    await page.goto("/favorites");
    await expect(page.getByRole("link", { name: "Nutella" })).toBeVisible();
  });

  test("rejects an invalid quantity and disables adding to history", async ({ page }) => {
    await mockOffProduct(page, MOCK_BARCODE, MOCK_OFF_RESPONSE);
    await page.goto(`/product?barcode=${MOCK_BARCODE}`);

    await page.getByLabel("Quantité (grammes)").fill("0");
    await expect(page.getByText(/quantité valide/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ajouter à l'historique" })).toBeDisabled();
  });
});
