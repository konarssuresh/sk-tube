import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[11px] px-[15px] text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  {
    variants: {
      variant: {
        default: "bg-surface-raised text-foreground hover:bg-surface-hover",
        primary: "bg-accent text-white hover:bg-accent-dark",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-hover",
        ghost:
          "bg-transparent text-muted hover:bg-surface-hover hover:text-foreground",
        danger:
          "border border-[#6a3844] bg-danger-soft text-[#ffafb4] hover:bg-[#4a2830]",
      },
      size: {
        default: "h-[42px] px-[15px]",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6",
        icon: "h-[42px] w-[42px] shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
