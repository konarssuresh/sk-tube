import { describe, expect, it } from "vitest";

import { filterChannelsBySearch } from "@/features/channels/utils";

const channels = [
  {
    id: "1",
    title: "Fireship",
    handle: "@Fireship",
  },
  {
    id: "2",
    title: "Theo",
    handle: "@theo",
  },
  {
    id: "3",
    title: "No Handle Channel",
    handle: null,
  },
];

describe("filterChannelsBySearch", () => {
  it("returns all channels when the query is empty", () => {
    expect(filterChannelsBySearch(channels, "")).toEqual(channels);
    expect(filterChannelsBySearch(channels, "   ")).toEqual(channels);
  });

  it("matches channel titles case-insensitively", () => {
    expect(filterChannelsBySearch(channels, "fire")).toEqual([channels[0]]);
    expect(filterChannelsBySearch(channels, "THEO")).toEqual([channels[1]]);
  });

  it("matches channel handles case-insensitively", () => {
    expect(filterChannelsBySearch(channels, "@fireship")).toEqual([channels[0]]);
    expect(filterChannelsBySearch(channels, "theo")).toEqual([channels[1]]);
  });

  it("matches title-only channels when handle is null", () => {
    expect(filterChannelsBySearch(channels, "no handle")).toEqual([channels[2]]);
  });

  it("preserves the original channel order", () => {
    expect(filterChannelsBySearch(channels, "fire")).toEqual([channels[0]]);
    expect(filterChannelsBySearch(channels, "no handle")).toEqual([channels[2]]);
  });
});
