import { describe, expect, it } from "vitest";

import {
  AppError,
  AppErrorCode,
  duplicateKeyAppError,
  fromZodError,
  isMongoDuplicateKeyError,
} from "@/lib/errors";
import { z } from "zod";

describe("application errors", () => {
  it("maps zod issues into validation errors", () => {
    const schema = z.object({
      email: z.email(),
    });
    const result = schema.safeParse({ email: "invalid" });

    const error = fromZodError(result.error);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(AppErrorCode.VALIDATION);
    expect(error.status).toBe(400);
    expect(error.details?.[0]?.path).toBe("email");
  });

  it("detects mongo duplicate key errors", () => {
    expect(
      isMongoDuplicateKeyError({
        name: "MongoServerError",
        code: 11000,
      }),
    ).toBe(true);
    expect(isMongoDuplicateKeyError(new Error("nope"))).toBe(false);
  });

  it("creates duplicate errors with conflict status", () => {
    const error = duplicateKeyAppError();

    expect(error.code).toBe(AppErrorCode.DUPLICATE);
    expect(error.status).toBe(409);
  });
});
