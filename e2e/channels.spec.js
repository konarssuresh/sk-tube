import { test, expect } from "@playwright/test";

import { addMockedChannel, registerViaApi } from "./helpers/auth.js";

test.describe("saved channels", () => {
  test("adds, searches, and removes a channel", async ({ page }) => {
    await registerViaApi(page);
    await page.goto("/dashboard");
    await expect(page.getByText("Your library is empty")).toBeVisible();

    await addMockedChannel(page);
    await expect(page.getByText("Your library is empty")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Fireship" })).toBeVisible();
    await expect(page.getByText("@Fireship")).toBeVisible();

    await page.getByLabel("Search saved channels").fill("fire");
    await expect(page.getByRole("heading", { name: "Fireship" })).toBeVisible();

    await page.getByLabel("Search saved channels").fill("missing-channel");
    await expect(page.getByText("No channels match your search")).toBeVisible();

    await page.getByLabel("Search saved channels").fill("");
    await page.getByRole("button", { name: "Remove Fireship" }).click();
    await page.getByRole("button", { name: "Remove channel" }).click();

    await expect(page.getByText("Your library is empty")).toBeVisible();
  });

  test("keeps add and search usable on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await registerViaApi(page);
    await page.goto("/dashboard");

    await addMockedChannel(page);
    await expect(page.getByRole("heading", { name: "Fireship" })).toBeVisible();
    await expect(page.getByLabel("Search saved channels")).toBeVisible();
  });
});
