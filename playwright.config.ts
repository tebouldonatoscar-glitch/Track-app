import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Some sandboxed environments pre-install a pinned Chromium build under
 * PLAYWRIGHT_BROWSERS_PATH instead of the version `npx playwright install`
 * would fetch for this @playwright/test release, so the default headless
 * shell path can 404. Fall back to that pinned full-Chromium binary when
 * present; otherwise let Playwright resolve its normal managed browser.
 */
function findPinnedChromiumExecutable(): string | undefined {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!browsersPath || !existsSync(browsersPath)) return undefined;

  const chromiumDir = readdirSync(browsersPath).find((name) => /^chromium-\d+$/.test(name));
  if (!chromiumDir) return undefined;

  const executablePath = path.join(browsersPath, chromiumDir, "chrome-linux", "chrome");
  return existsSync(executablePath) ? executablePath : undefined;
}

const pinnedChromiumExecutable = findPinnedChromiumExecutable();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: pinnedChromiumExecutable,
          args: [
            "--use-fake-device-for-media-stream",
            "--use-fake-ui-for-media-stream",
          ],
        },
        permissions: ["camera"],
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
