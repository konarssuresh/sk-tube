import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  it("includes installability fields and icon sizes", () => {
    const result = manifest();

    expect(result.name).toBe("SKTube");
    expect(result.short_name).toBe("SKTube");
    expect(result.start_url).toBe("/");
    expect(result.display).toBe("standalone");
    expect(result.theme_color).toBe("#0b0b0f");

    const sizes = result.icons.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(result.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
  });
});
