"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong.",
  message,
  onRetry,
  retryLabel = "Retry",
  className,
  ...props
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-[10px] bg-danger-soft px-[11px] py-[11px] text-[13px] leading-snug text-[#ffb1b6]",
        className,
      )}
      {...props}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold text-[#ffb1b6]">{title}</p>
        {message ? <p className="mt-1 text-[#ffb1b6]">{message}</p> : null}
        {onRetry ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-auto px-0 py-0 text-white hover:bg-transparent hover:text-white"
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
