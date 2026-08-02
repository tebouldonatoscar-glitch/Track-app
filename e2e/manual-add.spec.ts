import { test, expect } from "@playwright/test";

test.describe("Manual product entry", () => {
  test("saves a manually entered product and shows it on its product sheet", async ({ page }) => {
    await page.goto("/add?barcode=1234567890123");

    await expect(page.getByLabel("Code-barres *")).toHaveValue("1234567890123");

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
});
