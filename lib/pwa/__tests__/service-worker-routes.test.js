import { NetworkFirst } from "serwist";
import { describe, expect, it } from "vitest";

import {
  isCrossOriginCatchAllCacheRule,
  withoutCrossOriginCatchAllCache,
} from "@/lib/pwa/service-worker-routes";

describe("service-worker-routes", () => {
  it("detects Serwist's broad cross-origin NetworkFirst rule", () => {
    const crossOriginCatchAll = {
      matcher: ({ sameOrigin }) => !sameOrigin,
      handler: new NetworkFirst({ cacheName: "cross-origin" }),
    };

    expect(isCrossOriginCatchAllCacheRule(crossOriginCatchAll)).toBe(true);
  });

  it("keeps same-origin rules", () => {
    const sameOriginRule = {
      matcher: ({ sameOrigin, url: { pathname } }) =>
        sameOrigin && pathname.startsWith("/api/"),
      handler: new NetworkFirst({ cacheName: "apis" }),
    };

    expect(isCrossOriginCatchAllCacheRule(sameOriginRule)).toBe(false);
  });

  it("removes only the cross-origin catch-all from a cache list", () => {
    const crossOriginCatchAll = {
      matcher: ({ sameOrigin }) => !sameOrigin,
      handler: new NetworkFirst({ cacheName: "cross-origin" }),
    };
    const apiRule = {
      matcher: ({ sameOrigin, url: { pathname } }) =>
        sameOrigin && pathname.startsWith("/api/"),
      handler: new NetworkFirst({ cacheName: "apis" }),
    };

    const filtered = withoutCrossOriginCatchAllCache([
      apiRule,
      crossOriginCatchAll,
    ]);

    expect(filtered).toEqual([apiRule]);
  });
});
