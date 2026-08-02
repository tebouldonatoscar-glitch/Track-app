import { test, expect } from "@playwright/test";

test.describe("Manual product entry", () => {
  test("saves a manually entered product (with barcode) and shows it on its product sheet", async ({ page }) => {
    await page.goto("/add?barcode=1234567890123");

    await expect(page.getByLabel("Code-barres (optionnel)")).toHaveValue("1234567890123");

    await page.getByLabel("Nom du produit *").fill("Barre maison");
    await page.getByLabel("Marque").fill("Fait maison");
    await page.getByLabel("Calories (kcal)").fill("400");
    await page.getByLabel("Protéines (g)").fill("20");
    await page.getByLabel("Glucides (g)").fill("40");
    await page.getByLabel("Lipides (g)").fill("15");

    await page.getByRole("button", { name: "Enregistrer le produit" }).click();

    await expect(page).toHaveURL(/\/product\/?\?barcode=1234567890123/);
    await expect(page.getByRole("heading", { name: "Barre maison" })).toBeVisible();
    await expect(page.getByText("400 kcal")).toBeVisible();

    await page.screenshot({ path: "docs/screenshots/03-manual-add.png", fullPage: true });
  });

  test("saves a generic barcode-less product counted in units (egg)", async ({ page }) => {
    await page.goto("/add");

    // No barcode entered - a synthetic id should be generated on save.
    await expect(page.getByLabel("Code-barres (optionnel)")).toHaveValue("");

    await page.getByLabel("Nom du produit *").fill("Oeuf");
    await page.getByLabel(/se compte à l'unité/).check();
    await page.getByLabel("Nom de l'unité").fill("œuf");
    await page.getByLabel("Poids moyen d'une unité (g)").fill("53");

    // Enter nutrition per unit instead of per 100g.
    await page.getByLabel("Saisir par unité plutôt que pour 100g").check();
    await page.getByLabel("Calories (kcal)").fill("70");
    await page.getByLabel("Protéines (g)").fill("6");
    await page.getByLabel("Glucides (g)").fill("0.5");
    await page.getByLabel("Lipides (g)").fill("5");

    await page.getByRole("button", { name: "Enregistrer le produit" }).click();

    await expect(page).toHaveURL(/\/product\/?\?barcode=generic-oeuf-/);
    await expect(page.getByRole("heading", { name: "Oeuf" })).toBeVisible();

    // Default quantity should be 1 unit (53g) and macros should match the
    // per-unit values entered, not be scaled as if they were per-100g.
    await expect(page.getByLabel("Quantité (œufs)")).toHaveValue("1");
    await expect(page.getByText("70 kcal")).toBeVisible();
    await expect(page.getByText("6 g", { exact: true })).toBeVisible();

    await page.screenshot({ path: "docs/screenshots/05-generic-unit-product.png", fullPage: true });

    // Switch to 3 eggs and check macros scale linearly.
    await page.getByLabel("Quantité (œufs)").fill("3");
    await expect(page.getByText("210 kcal")).toBeVisible();
  });

  test("manual add form requires a unit weight when 'counted in units' is checked", async ({ page }) => {
    await page.goto("/add");
    await page.getByLabel("Nom du produit *").fill("Farine");
    await page.getByLabel(/se compte à l'unité/).check();
    await page.getByLabel("Nom de l'unité").fill("cuillère");
    await page.getByRole("button", { name: "Enregistrer le produit" }).click();
    await expect(page.getByText(/poids moyen d'une unité/)).toBeVisible();
  });
});
