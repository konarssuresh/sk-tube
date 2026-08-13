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
});
