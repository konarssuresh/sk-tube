"use client";

import { Button } from "@/components/ui/button";

export function OfflineRetryAction() {
  return (
    <Button type="button" onClick={() => window.location.reload()}>
      Try again
    </Button>
  );
}
