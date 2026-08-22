import { test, expect } from "@playwright/test";

import { registerViaApi } from "./helpers/auth.js";

test.describe("discovery search", () => {
  test("searches videos, scrolls results, and plays a searched video", async ({
    page,
  }) => {
    await registerViaApi(page);
    await page.goto("/search/videos");

    await page.getByLabel("Search videos").fill("modern react");
    await expect(
      page.getByRole("heading", { name: "Eligible e2e-search-0" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Eligible e2e-search-49" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Eligible e2e-search-50" }),
    ).toHaveCount(0);

    await page
      .getByRole("heading", { name: "Eligible e2e-search-49" })
      .scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: "Eligible e2e-search-50" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText("You've reached the end of available results."),
    ).toBeVisible();

    await page.getByRole("link", { name: "Eligible e2e-search-0" }).click();
    await page.waitForURL("**/search/videos/e2e-search-0");

    await expect(
      page.locator('iframe[src*="youtube-nocookie.com/embed/e2e-search-0"]'),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Open on YouTube" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Eligible e2e-search-0" }),
    ).toBeVisible();
    await expect(
      page.getByText("This channel is not in your library."),
    ).toBeVisible();
  });

  test("rejects ineligible searched videos", async ({ page }) => {
    await registerViaApi(page);

    const response = await page.goto("/search/videos/e2e-search-short");

    expect(response?.status()).toBe(404);
  });

  test("searches channels, adds a discovered channel, and prevents duplicates", async ({
    page,
  }) => {
    await registerViaApi(page);
    await page.goto("/search/channels");

    await page.getByLabel("Search channels").fill("frontend");
    const frontendMastersCard = page
      .locator("article")
      .filter({ hasText: "Frontend Masters" });
    await expect(
      frontendMastersCard.getByRole("heading", { name: "Frontend Masters" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(frontendMastersCard.getByText("Not yet saved")).toBeVisible();

    await frontendMastersCard
      .getByRole("button", { name: "Add to library" })
      .click();

    await expect(frontendMastersCard.getByText("In your library")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      frontendMastersCard.getByRole("button", { name: "Added" }),
    ).toBeDisabled();

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Add Channel" }).first().click();
    await page.getByLabel("Channel handle or URL").fill("@FrontendMasters");
    await page.getByRole("button", { name: "Preview channel" }).click();
    await page.getByRole("heading", { name: "Frontend Masters" }).waitFor();
    await page.getByRole("button", { name: "Add channel" }).click();

    await expect(
      page.getByText("This channel is already in your library."),
    ).toBeVisible();
  });

  test("navigates between discover views from the dashboard", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/dashboard");

    await page.getByRole("link", { name: "Discover" }).click();
    await page.waitForURL("**/search/videos");
    await expect(
      page.getByRole("heading", { name: "Find videos worth watching." }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Channels" }).click();
    await page.waitForURL("**/search/channels");
    await expect(
      page.getByRole("heading", { name: "Find your next creator." }),
    ).toBeVisible();
  });
});
