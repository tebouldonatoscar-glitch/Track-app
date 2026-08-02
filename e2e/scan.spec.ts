import { test, expect } from "@playwright/test";

test.describe("Scanner page", () => {
  test("starts the camera viewport using a fake media device", async ({ page }) => {
    await page.goto("/scan");

    await expect(page.getByRole("heading", { name: "Scanner un produit" })).toBeVisible();
    // With --use-fake-device-for-media-stream the camera starts successfully,
    // so the scanner should reach the "running" state instead of an error.
    await expect(page.getByText(/Visez le code-barres/)).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: "docs/screenshots/04-scan.png", fullPage: true });
  });
});
