import { afterEach, describe, expect, it, vi } from "vitest";

import { loginUser, logoutUser, registerUser } from "@/features/auth/api";

describe("auth api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loginUser returns parsed success payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          user: {
            id: "507f1f77bcf86cd799439011",
            email: "user@example.com",
          },
        }),
      }),
    );

    await expect(
      loginUser({ email: "user@example.com", password: "password123" }),
    ).resolves.toEqual({
      user: {
        id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
      },
    });

    expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        password: "password123",
      }),
    });
  });

  it("registerUser throws normalized API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          code: "DUPLICATE",
          message: "An account with this email already exists.",
        }),
      }),
    );

    await expect(
      registerUser({
        name: "Suresh Konar",
        email: "user@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({
      code: "DUPLICATE",
      message: "An account with this email already exists.",
    });
  });

  it("logoutUser returns success payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );

    await expect(logoutUser()).resolves.toEqual({ success: true });

    expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("throws a generic internal error when response JSON is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("invalid json");
        },
      }),
    );

    await expect(
      loginUser({ email: "user@example.com", password: "password123" }),
    ).rejects.toMatchObject({
      code: "INTERNAL",
      message: "Something went wrong. Please try again.",
    });
  });
});
