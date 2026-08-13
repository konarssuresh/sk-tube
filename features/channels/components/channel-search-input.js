import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ChannelSearchInput({ value, onChange, className, ...props }) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search channels by name or handle"
        aria-label="Search saved channels"
        className="pl-10"
        {...props}
      />
    </div>
  );
}
