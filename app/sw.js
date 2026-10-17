import { defaultCache } from "@serwist/turbopack/worker";
import { NetworkOnly, Serwist } from "serwist";

import { withoutCrossOriginCatchAllCache } from "@/lib/pwa/service-worker-routes";

const runtimeCaching = [
  {
    matcher: ({ url: { pathname }, sameOrigin }) =>
      sameOrigin && pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
  ...withoutCrossOriginCatchAllCache(defaultCache),
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
