"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const NavigationProgressContext = createContext({
  isNavigating: false,
  startNavigation: () => {},
});

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

function isModifiedClick(event) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function isInternalNavigationLink(anchor) {
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function NavigationProgressProvider({ children }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const previousPathnameRef = useRef(pathname);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (isModifiedClick(event)) {
        return;
      }

      const anchor = event.target.closest("a");

      if (!isInternalNavigationLink(anchor)) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);

      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        destination.hash === window.location.hash
      ) {
        return;
      }

      startNavigation();
    }

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [startNavigation]);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      setIsNavigating(false);
    }
  }, [pathname]);

  return (
    <NavigationProgressContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
    </NavigationProgressContext.Provider>
  );
}
