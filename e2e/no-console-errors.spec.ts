import { test, expect } from "@playwright/test";
import { MOCK_BARCODE, MOCK_OFF_RESPONSE, mockOffProduct } from "./fixtures";

const ROUTES = ["/", "/scan", "/history", "/favorites", "/goals", "/add", "/foods", "/describe"];

test.describe("No unexpected console errors", () => {
  for (const route of ROUTES) {
    test(`route ${route} has no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(route);
      await page.waitForLoadState("networkidle");

      expect(errors).toEqual([]);
    });
  }

  test("product page has no console errors once loaded", async ({ page }) => {
    await mockOffProduct(page, MOCK_BARCODE, MOCK_OFF_RESPONSE);
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`/product?barcode=${MOCK_BARCODE}`);
    await page.getByRole("heading", { name: "Nutella" }).waitFor();

    expect(errors).toEqual([]);
  });
});
