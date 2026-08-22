import { getFilterSnapshot } from "@/features/feed/utils";

export const feedKeys = {
  all: ["feed"],
  videos: (filters) => [...feedKeys.all, "videos", getFilterSnapshot(filters)],
};
