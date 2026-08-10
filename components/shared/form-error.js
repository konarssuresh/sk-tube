import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function FormError({ message, className, ...props }) {
  if (!message) {
    return null;
  }

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
      <span>{message}</span>
    </div>
  );
}
