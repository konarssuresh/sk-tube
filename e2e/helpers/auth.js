import { expect } from "@playwright/test";

export function uniqueUser() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

  return {
    name: "E2E User",
    email: `sktube-e2e-${suffix}@example.com`,
    password: "password123",
  };
}

export async function registerViaApi(page, user = uniqueUser()) {
  const response = await page.request.post("/api/auth/register", {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Registration failed: ${response.status()} ${await response.text()}`);
  }

  return user;
}

export async function addMockedChannel(page) {
  await page.getByRole("button", { name: "Add Channel" }).first().click();
  await page.getByLabel("Channel handle or URL").fill("@Fireship");
  await page.getByRole("button", { name: "Preview channel" }).click();
  await page.getByRole("heading", { name: "Fireship" }).waitFor();
  await page.getByRole("button", { name: "Add channel" }).click();
  await expect(page.getByLabel("Add a channel")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Fireship" })).toBeVisible();
}
