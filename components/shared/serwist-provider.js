"use client";

import { SerwistProvider } from "@serwist/turbopack/react";

export function AppSerwistProvider({ children }) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
    >
      {children}
    </SerwistProvider>
  );
}
