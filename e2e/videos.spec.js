import { test, expect } from "@playwright/test";

import { addMockedChannel, registerViaApi } from "./helpers/auth.js";

test.describe("channel videos", () => {
  test("browses eligible videos and loads another page", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/dashboard");
    await addMockedChannel(page);

    await page.getByRole("link", { name: /Fireship/ }).click();
    await page.waitForURL("**/channels/**");

    await expect(
      page.getByRole("heading", { name: "Eligible e2e-video-0" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Eligible e2e-video-49" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Eligible e2e-video-50" }),
    ).toHaveCount(0);

    await page
      .getByRole("heading", { name: "Eligible e2e-video-49" })
      .scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: "Eligible e2e-video-50" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText("You've reached the end of available videos."),
    ).toBeVisible();
  });

  test("opens an embedded video and shows Open on YouTube", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/dashboard");
    await addMockedChannel(page);

    await page.getByRole("link", { name: /Fireship/ }).click();
    await page.waitForURL(/\/channels\/([^/]+)$/);

    const channelUrl = page.url();
    await page.goto(`${channelUrl}/videos/e2e-video-0`);

    await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/e2e-video-0"]')).toBeVisible();
    await expect(page.locator('iframe[src*="autoplay=1"]')).toBeVisible();
    await expect(page.getByRole("link", { name: "Open on YouTube" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eligible e2e-video-0" })).toBeVisible();
  });

  test("shows fallback UI for non-embeddable videos", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/dashboard");
    await addMockedChannel(page);

    await page.getByRole("link", { name: /Fireship/ }).click();
    await page.waitForURL(/\/channels\/([^/]+)$/);

    const channelUrl = page.url();

    await page.goto(`${channelUrl}/videos/nonembedab1`);

    await expect(page.getByRole("heading", { name: "This video can't play here." })).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open on YouTube" }).first()).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=nonembedab1",
    );
    await expect(page.getByRole("heading", { name: "Eligible nonembedab1" })).toBeVisible();
  });
});
