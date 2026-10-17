"use client";

import { useEffect } from "react";

/**
 * SKTube previously registered a Serwist service worker for PWA offline
 * support. That worker interfered with YouTube embeds. Unregister any
 * lingering workers so playback matches the pre-PWA network behavior.
 */
export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
  }, []);

  return null;
}
