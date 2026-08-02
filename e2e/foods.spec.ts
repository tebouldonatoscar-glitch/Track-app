import { test, expect } from "@playwright/test";

test.describe("Built-in foods database", () => {
  test("browses and searches common foods, then opens one", async ({ page }) => {
    await page.goto("/foods");

    await expect(page.getByRole("heading", { name: "Aliments courants" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fruits" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Œufs & laitages" })).toBeVisible();

    await page.getByPlaceholder("Rechercher un aliment…").fill("oeuf");
    await expect(page.getByText("Œuf", { exact: true })).toBeVisible();
    await expect(page.getByText("Pomme", { exact: true })).not.toBeVisible();

    await page.getByText("Œuf", { exact: true }).click();
    await expect(page).toHaveURL(/\/product\/?\?barcode=builtin-oeuf/);
    await expect(page.getByRole("heading", { name: "Œuf" })).toBeVisible();
    await expect(page.getByLabel("Quantité (œufs)")).toHaveValue("1");

    await page.screenshot({ path: "docs/screenshots/06-foods-browse.png", fullPage: true });
  });

  test("searching with no match shows an empty state", async ({ page }) => {
    await page.goto("/foods");
    await page.getByPlaceholder("Rechercher un aliment…").fill("zzzznotfound");
    await expect(page.getByText("Aucun résultat.")).toBeVisible();
  });
});
