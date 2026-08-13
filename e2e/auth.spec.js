import { test, expect } from "@playwright/test";

import { uniqueUser } from "./helpers/auth.js";

test.describe("authentication", () => {
  test("registers, logs out, and logs back in", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/register");
    await page.getByLabel("Your name").fill(user.name);
    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForURL("**/login");

    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
  });

  test("redirects unauthenticated visitors away from protected pages", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");

    await page.goto("/channels/507f1f77bcf86cd799439012");
    await page.waitForURL("**/login");
  });
});
