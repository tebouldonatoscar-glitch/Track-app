import { test, expect } from "@playwright/test";

test.describe("Home dashboard", () => {
  test("renders the dashboard with scan CTA and daily goals", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Accueil" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Scanner un produit/ })).toBeVisible();
    await expect(page.getByText("Aujourd'hui")).toBeVisible();
    await expect(page.getByText(/kcal/)).toBeVisible();

    await page.screenshot({ path: "docs/screenshots/01-home.png", fullPage: true });
  });

  test("bottom navigation links to all main sections", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    for (const [label, url] of [
      ["Tendances", "/trends/"],
      ["Favoris", "/favorites/"],
      ["Objectifs", "/goals/"],
    ] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(url.replace("/", "\\/")));
      await page.goBack();
    }
  });
});
