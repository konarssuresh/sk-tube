import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DiscoverSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
  ...props
}) {
  return (
    <div className={cn("relative max-w-[640px]", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-10"
        {...props}
      />
    </div>
  );
}
