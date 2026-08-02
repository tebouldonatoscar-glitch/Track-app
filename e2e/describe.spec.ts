import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const FAKE_API_KEY = "test-fake-gemini-key";

async function mockGemini(page: Page, jsonEstimate: Record<string, unknown>, status = 200) {
  await page.route("https://generativelanguage.googleapis.com/**", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify(jsonEstimate) }] } }],
      }),
    })
  );
}

async function mockGeminiError(page: Page, status: number, message: string) {
  await page.route("https://generativelanguage.googleapis.com/**", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ error: { code: status, message, status: "ERROR" } }),
    })
  );
}

test.describe("AI meal estimation", () => {
  test("shows the API key setup section when no key is stored", async ({ page }) => {
    await page.goto("/describe");
    await expect(page.getByLabel("Clé API Gemini")).toBeVisible();
    await expect(page.getByRole("button", { name: "Estimer avec l'IA" })).toBeDisabled();
  });

  test("estimates a described dish and logs it to history", async ({ page }) => {
    await mockGemini(page, {
      dishName: "Bol de riz au poulet",
      estimatedTotalWeightGrams: 350,
      energyKcal: 520,
      proteins: 35,
      carbohydrates: 60,
      sugars: 4,
      fat: 12,
      saturatedFat: 3,
      fiber: 5,
      salt: 1.2,
      confidenceNote: "Portion standard supposée.",
    });

    await page.goto("/describe");

    await page.getByLabel("Clé API Gemini").fill(FAKE_API_KEY);
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await page
      .getByLabel("Description du plat")
      .fill("Un bol de riz avec du poulet grillé et des légumes sautés, environ 350g");

    await page.getByRole("button", { name: "Estimer avec l'IA" }).click();

    await expect(page.getByLabel("Nom du plat")).toHaveValue("Bol de riz au poulet");
    await expect(page.getByText("520 kcal")).toBeVisible();
    await expect(page.getByText("Portion standard supposée.")).toBeVisible();
    await expect(page.getByText(/pas aussi fiable qu'un scan/)).toBeVisible();

    await page.screenshot({ path: "docs/screenshots/07-ai-describe.png", fullPage: true });

    await page.getByRole("button", { name: "Ajouter à l'historique" }).click();
    await expect(page).toHaveURL(/\/history\/?$/, { timeout: 5000 });
    await expect(page.getByRole("link", { name: "Bol de riz au poulet" })).toBeVisible();
  });

  test("shows a clear error message when the API key is rejected", async ({ page }) => {
    await mockGemini(page, {}, 403);
    await page.goto("/describe");

    await page.getByLabel("Clé API Gemini").fill("clé-invalide");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await page.getByLabel("Description du plat").fill("Une pomme");
    await page.getByRole("button", { name: "Estimer avec l'IA" }).click();

    await expect(page.getByText(/Clé API invalide/)).toBeVisible();
  });

  test("surfaces Google's actual error message alongside the friendly one", async ({ page }) => {
    await mockGeminiError(page, 429, "You exceeded your current quota, please check your plan and billing details.");
    await page.goto("/describe");

    await page.getByLabel("Clé API Gemini").fill(FAKE_API_KEY);
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await page.getByLabel("Description du plat").fill("Une pomme");
    await page.getByRole("button", { name: "Estimer avec l'IA" }).click();

    await expect(page.getByText(/Limite d'utilisation gratuite atteinte/)).toBeVisible();
    await expect(page.getByText(/détail Google : You exceeded your current quota/)).toBeVisible();
    await expect(page.getByText(/Essaie un autre modèle/)).toBeVisible();
  });

  test("remembers a previously saved API key across visits", async ({ page }) => {
    await page.goto("/describe");
    await page.getByLabel("Clé API Gemini").fill(FAKE_API_KEY);
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await page.reload();
    await expect(page.getByText("Clé API Gemini (enregistrée)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Estimer avec l'IA" })).toBeDisabled();

    await page.getByLabel("Description du plat").fill("Une pomme");
    await expect(page.getByRole("button", { name: "Estimer avec l'IA" })).toBeEnabled();
  });
});
