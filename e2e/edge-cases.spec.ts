import { test, expect } from "@playwright/test";
import { mockOffNetworkError, mockOffNotFound } from "./fixtures";

const UNKNOWN_BARCODE = "9999999999999";

test.describe("Edge cases", () => {
  test("offers manual add when the product is not found", async ({ page }) => {
    await mockOffNotFound(page, UNKNOWN_BARCODE);
    await page.goto(`/product?barcode=${UNKNOWN_BARCODE}`);

    await expect(page.getByText(/introuvable/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Ajouter ce produit manuellement/ })).toBeVisible();
  });

  test("shows a network error message and retry option when offline", async ({ page }) => {
    await mockOffNetworkError(page, UNKNOWN_BARCODE);
    await page.goto(`/product?barcode=${UNKNOWN_BARCODE}`);

    await expect(page.getByText(/Pas de connexion internet/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Réessayer" })).toBeVisible();
  });

  test("shows an invalid barcode message for malformed barcodes", async ({ page }) => {
    await page.goto(`/product?barcode=abc`);
    await expect(page.getByText(/Code-barres invalide/)).toBeVisible();
  });

  test("manual add form validates the barcode format", async ({ page }) => {
    await page.goto("/add");
    await page.getByLabel("Code-barres *").fill("abc");
    await page.getByLabel("Nom du produit *").fill("Produit test");
    await page.getByRole("button", { name: "Enregistrer le produit" }).click();
    await expect(page.getByText(/Code-barres invalide/)).toBeVisible();
  });
});
