import { test, expect } from "@playwright/test";

import { addMockedChannel, registerViaApi } from "./helpers/auth.js";

test.describe("home feed", () => {
  test("lands on home, shows merged feed, and plays a video", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/home");

    await expect(
      page.getByRole("heading", { name: "Latest from your channels" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "My Channels", exact: true }),
    ).toBeVisible();

    await page.goto("/dashboard");
    await addMockedChannel(page);

    await page.goto("/home");
    await expect(
      page.getByRole("heading", { name: "Eligible e2e-video-0" }),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: "Eligible e2e-video-0" }).click();
    await page.waitForURL("**/channels/*/videos/e2e-video-0");
    await expect(
      page.locator('iframe[src*="youtube-nocookie.com/embed/e2e-video-0"]'),
    ).toBeVisible();
  });

  test("shows empty library state without saved channels", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/home");

    await expect(page.getByText("Your library is empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Discover" })).toBeVisible();
  });

  test("navigates between primary destinations", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/home");

    await page.getByRole("link", { name: "My Channels", exact: true }).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: "My Channels" })).toBeVisible();

    await page.getByRole("link", { name: "Discover", exact: true }).click();
    await page.waitForURL("**/search/videos");
  });
});
