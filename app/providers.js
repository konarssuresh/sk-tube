"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { NavigationProgress } from "@/components/shared/navigation-progress";
import { NavigationProgressProvider } from "@/components/shared/navigation-progress-provider";
import { LegacyServiceWorkerCleanup } from "@/components/shared/legacy-service-worker-cleanup";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export default function Providers({ children }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <LegacyServiceWorkerCleanup />
      <NavigationProgressProvider>
        <NavigationProgress />
        {children}
      </NavigationProgressProvider>
    </QueryClientProvider>
  );
}
