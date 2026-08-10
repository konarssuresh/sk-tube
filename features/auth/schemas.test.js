import { describe, expect, it } from "vitest";

import {
  loginSchema,
  parseLoginInput,
  parseRegisterInput,
  registerSchema,
} from "@/features/auth/schemas";
import { AppError, AppErrorCode } from "@/lib/errors";

describe("auth schemas", () => {
  it("accepts valid registration input and normalizes email", () => {
    const parsed = parseRegisterInput({
      name: "Suresh Konar",
      email: "  User@Example.com ",
      password: "password123",
    });

    expect(parsed).toEqual({
      name: "Suresh Konar",
      email: "user@example.com",
      password: "password123",
    });
  });

  it("rejects short passwords during registration", () => {
    expect(() =>
      parseRegisterInput({
        name: "Suresh Konar",
        email: "user@example.com",
        password: "short",
      }),
    ).toThrow(AppError);

    try {
      parseRegisterInput({
        name: "Suresh Konar",
        email: "user@example.com",
        password: "short",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(AppErrorCode.VALIDATION);
    }
  });

  it("rejects invalid email addresses", () => {
    expect(
      registerSchema.safeParse({
        name: "Suresh Konar",
        email: "not-an-email",
        password: "password123",
      }).success,
    ).toBe(false);
  });

  it("accepts valid login input", () => {
    expect(
      parseLoginInput({
        email: "User@Example.com",
        password: "password123",
      }),
    ).toEqual({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("rejects empty login passwords", () => {
    expect(
      loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      }).success,
    ).toBe(false);
  });
});
