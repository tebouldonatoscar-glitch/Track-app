import { test, expect } from "@playwright/test";
import { MOCK_BARCODE, MOCK_OFF_RESPONSE, mockOffProduct } from "./fixtures";

test.describe("History and goals", () => {
  test("deletes a history entry", async ({ page }) => {
    await mockOffProduct(page, MOCK_BARCODE, MOCK_OFF_RESPONSE);
    await page.goto(`/product?barcode=${MOCK_BARCODE}`);
    await page.getByRole("button", { name: "Ajouter à l'historique" }).click();
    await expect(page.getByText("Ajouté à l'historique !")).toBeVisible();

    await page.goto("/history");
    await expect(page.getByRole("link", { name: "Nutella" })).toBeVisible();

    await page.getByRole("button", { name: "Supprimer" }).click();
    await expect(page.getByText("Aucun scan enregistré pour le moment.")).toBeVisible();
  });

  test("CSV export button appears once there is history", async ({ page }) => {
    await mockOffProduct(page, MOCK_BARCODE, MOCK_OFF_RESPONSE);
    await page.goto(`/product?barcode=${MOCK_BARCODE}`);
    await page.getByRole("button", { name: "Ajouter à l'historique" }).click();

    await page.goto("/history");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exporter en CSV" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/nutriscan-historique-.*\.csv/);
  });

  test("updates and persists daily goals", async ({ page }) => {
    await page.goto("/goals");
    await page.getByLabel("Calories (kcal)").fill("2500");
    await page.getByLabel("Protéines (g)").fill("180");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Objectifs enregistrés !")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Calories (kcal)")).toHaveValue("2500");
    await expect(page.getByLabel("Protéines (g)")).toHaveValue("180");

    await page.goto("/");
    await expect(page.getByText(/2500 kcal/)).toBeVisible();
  });
});
