import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoadingState({
  message = "Loading…",
  className,
  ...props
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2.5 text-sm text-muted",
        className,
      )}
      {...props}
    >
      <Loader2 className="size-[17px] animate-spin-slow text-accent" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
