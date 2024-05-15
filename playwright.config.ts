import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"

dotenv.config()
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright/playwright-report", open: "on-failure" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    /* We can also have tests running in Firefox in the future */
    //{
    //  name: "firefox",
    //  use: { ...devices["Desktop Firefox"] },
    //},
  ],
})
